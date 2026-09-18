import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  stops,
  packetLocations,
  type Progress,
  type StopId,
} from "@/data/world";
import {
  initialCar,
  stepCar,
  type DriveInput,
  type Obstacle,
} from "./driving-physics";

export interface WorldCallbacks {
  onUpdate: (state: {
    x: number;
    z: number;
    heading: number;
    speed: number;
    distance: number;
    nearby: StopId | null;
  }) => void;
  onPacket: (id: number) => void;
  onInteract: (id: StopId) => void;
  onError: () => void;
}
export class DrivingWorld {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-32, 32, 24, -24, 0.1, 200);
  private car = { ...initialCar };
  private vehicle = new THREE.Group();
  private wheels: THREE.Mesh[] = [];
  private obstacles: Obstacle[] = [];
  private input: DriveInput = {
    forward: false,
    reverse: false,
    left: false,
    right: false,
    brake: false,
  };
  private collected = new Set<number>();
  private packets: THREE.Group[] = [];
  private markerRings: THREE.Mesh[] = [];
  private labelSprites: THREE.Sprite[] = [];
  private materialCache = new Map<string, THREE.MeshStandardMaterial>();
  private raf = 0;
  private last = 0;
  private clock = 0;
  private lastUi = 0;
  private paused = false;
  private disposed = false;
  private cameraTarget = new THREE.Vector3();
  private resizeObserver: ResizeObserver;
  private reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private nearby: StopId | null = null;
  private pointerDown = false;
  private cameraTween: {
    started: number;
    duration: number;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    fromOffset: THREE.Vector3;
    toOffset: THREE.Vector3;
    fromZoom: number;
    toZoom: number;
    done?: () => void;
  } | null = null;
  private focusedStop: StopId | null = null;
  private particles: {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
    scale: number;
  }[] = [];
  private burstCursor = 0;
  private dustAt = 0;
  private arrivalRing = new THREE.Mesh(
    new THREE.RingGeometry(1.8, 1.95, 64),
    new THREE.MeshBasicMaterial({
      color: 0xfff2bd,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  private arrivalAge = 10;
  private carFocus = new THREE.Vector3();

  constructor(
    private container: HTMLDivElement,
    private callbacks: WorldCallbacks,
    progress: Progress,
  ) {
    this.collected = new Set(progress.collected);
    this.car.distance = progress.distance;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "low-power",
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    this.renderer.setClearColor(0xe9dfc7);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.domElement.setAttribute(
      "aria-label",
      "3D driving world. Use W A S D or arrow keys to drive, Space to brake, E to explore nearby stops, and R to respawn.",
    );
    this.renderer.domElement.setAttribute("role", "img");
    this.renderer.domElement.tabIndex = 0;
    this.container.appendChild(this.renderer.domElement);
    this.scene.background = new THREE.Color(0xe9dfc7);
    this.scene.fog = new THREE.Fog(0xe9dfc7, 80, 150);
    const ambient = new THREE.HemisphereLight(0xfff8e8, 0xb5a483, 2.4);
    this.scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffe9bf, 3.5);
    sun.position.set(-25, 45, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -43;
    sun.shadow.camera.right = 43;
    sun.shadow.camera.top = 43;
    sun.shadow.camera.bottom = -43;
    sun.shadow.camera.far = 130;
    sun.shadow.bias = -0.0008;
    sun.shadow.normalBias = 0.06;
    sun.shadow.radius = 3;
    this.scene.add(sun);
    this.createCampus();
    this.addDetails();
    this.createCar();
    this.createPackets();
    this.createEffects();
    // The first framebuffer uses the same framing as normal driving.
    this.vehicle.position.set(this.car.x, 0, this.car.z);
    this.vehicle.rotation.y = this.car.heading;
    this.cameraTarget.set(this.car.x * 0.7, 0, this.car.z * 0.7 - 2);
    this.camera.position
      .copy(this.cameraTarget)
      .add(new THREE.Vector3(30, 40, 34));
    this.camera.zoom = 1;
    this.camera.lookAt(this.cameraTarget);
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(container);
    this.resize();
    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);
    window.addEventListener("blur", this.clearInput);
    document.addEventListener("visibilitychange", this.visibility);
    this.renderer.domElement.addEventListener(
      "webglcontextlost",
      this.contextLost,
    );
    this.renderer.domElement.addEventListener(
      "pointerdown",
      this.worldPointerDown,
    );
    this.renderer.domElement.addEventListener("pointerup", this.worldPointerUp);
    this.start();
  }
  private mat(color: string | number, roughness = 0.85) {
    const key = `${color}:${roughness}`;
    if (!this.materialCache.has(key))
      this.materialCache.set(
        key,
        new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 }),
      );
    return this.materialCache.get(key)!;
  }
  private box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string | number,
    parent: THREE.Object3D = this.scene,
  ) {
    const mesh = new THREE.Mesh(
      Math.min(w, h, d) > 0.25
        ? new RoundedBoxGeometry(w, h, d, 1, Math.min(w, h, d) * 0.09)
        : new THREE.BoxGeometry(w, h, d),
      this.mat(color),
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  private cylinder(
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
    color: string | number,
    segments = 12,
    parent: THREE.Object3D = this.scene,
  ) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, h, segments),
      this.mat(color),
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  private label(
    text: string,
    x: number,
    y: number,
    z: number,
    width = 9,
    background = "#fff8e8",
    ink = "#35443b",
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = background;
    ctx.beginPath();
    ctx.roundRect(5, 5, 758, 118, 24);
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.font = "bold 37px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 384, 66);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, depthTest: true }),
    );
    sprite.position.set(x, y, z);
    sprite.scale.set(width, width / 6, 1);
    this.scene.add(sprite);
    this.labelSprites.push(sprite);
    return sprite;
  }
  private tree(x: number, z: number, scale = 1, color = 0x75925e) {
    this.cylinder(x, 0.85 * scale, z, 0.18 * scale, 1.7 * scale, 0x927554, 7);
    const crown = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.25 * scale, 0),
      this.mat(color),
    );
    crown.position.set(x, 2.1 * scale, z);
    crown.scale.y = 1.15;
    crown.castShadow = true;
    this.scene.add(crown);
    this.obstacles.push({ x, z, halfX: 0.45 * scale, halfZ: 0.45 * scale });
  }
  private createCampus() {
    this.box(0, -1.3, -1, 66, 2, 65, 0xcbad83);
    this.box(0, -0.23, -1, 65, 0.25, 64, 0xc6c3a0);
    const roadColor = 0xece0c4;
    this.box(0, -0.065, -1, 7, 0.08, 59, roadColor);
    for (const x of [-16, 16]) this.box(x, -0.06, 4.5, 6, 0.08, 30, roadColor);
    for (const z of [-7, 16]) this.box(0, -0.055, z, 39, 0.09, 6, roadColor);
    for (let z = -26; z <= 25; z += 4) {
      if (Math.abs(z + 7) < 4 || Math.abs(z - 16) < 4) continue;
      this.box(0, 0.001, z, 0.14, 0.01, 1.3, 0xc5b998);
    }
    for (const z of [-7, 16])
      for (let x = -18; x <= 18; x += 4) {
        if (Math.abs(x) < 4) continue;
        this.box(x, 0.005, z, 1.3, 0.01, 0.13, 0xc5b998);
      }
    // Workshop: a small terracotta garage with a solar roof and visible server racks.
    this.building(-16, -14, 0xc27951, 7, 4.4, 5);
    this.box(-16, 4.55, -14, 7.6, 0.3, 5.6, 0x495d5e);
    for (const x of [-18, -16, -14]) {
      this.box(x, 4.77, -14, 1.5, 0.12, 3.9, 0x263d47);
      this.box(x, 4.85, -14, 0.06, 0.03, 3.9, 0x6f8d96);
    }
    this.box(-16, 1.6, -11.46, 3.4, 3.2, 0.13, 0x394842);
    for (let i = 0; i < 4; i++)
      this.box(-16, 0.5 + i * 0.7, -11.34, 3, 0.07, 0.12, 0x8b9f8c);
    this.label("01 / JAVA WORKSHOP", -16, 6.35, -14, 10);
    // Experience HQ with an antenna and two differently sized blocks.
    this.building(15, -14, 0x699c90, 7, 5.6, 5);
    this.building(20, -14, 0x8bb0a0, 3, 3.5, 5);
    this.box(15, 5.85, -14, 7.5, 0.4, 5.5, 0x3e6e67);
    for (let x = 12.5; x <= 17.5; x += 1.7)
      for (const y of [1.8, 3.8])
        this.box(x, y, -11.46, 1.05, 1.25, 0.12, 0xd6e7d7);
    this.cylinder(16, 7.1, -14, 0.1, 2.5, 0x4b6960, 8);
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      this.mat(0xe4d9b9),
    );
    dish.position.set(16, 8, -14);
    dish.rotation.z = 0.5;
    this.scene.add(dish);
    this.label("02 / EXPERIENCE HQ", 16, 10, -14, 10.5);
    // Data Garden: a greenhouse and rows of seedlings.
    this.building(-16, 9.2, 0xa5af72, 7, 3.4, 4.5);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(5.3, 2, 4),
      this.mat(0x648b71),
    );
    roof.rotation.y = Math.PI / 4;
    roof.scale.z = 0.72;
    roof.position.set(-16, 4.3, 9.2);
    roof.castShadow = true;
    this.scene.add(roof);
    for (const x of [-18, -16, -14])
      this.box(x, 1.8, 11.5, 1.25, 1.5, 0.1, 0xc6dec7);
    for (let x = -22; x <= -19; x += 1.4)
      for (let z = 6; z <= 12; z += 2) {
        this.box(x, 0.08, z, 1.05, 0.22, 1.3, 0x8c7951);
        const leaf = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.4, 0),
          this.mat(0x6f9654),
        );
        leaf.position.set(x, 0.45, z);
        this.scene.add(leaf);
      }
    this.label("03 / DATA GARDEN", -16, 6, 9, 9.5);
    // Learning Lab: lilac studio, books, skylight and chimney.
    this.building(16, 9.3, 0xa896b7, 7, 4, 4.5);
    this.box(16, 4.2, 9.3, 7.5, 0.3, 5, 0x6e6689);
    this.box(16, 4.5, 9.3, 3.4, 0.4, 2.5, 0xb5c9c6);
    this.box(18, 5.1, 8, 1, 1.7, 1, 0x8f829e);
    for (const x of [13.6, 15.9, 18.2])
      this.box(x, 2.4, 11.61, 1.3, 1.7, 0.1, 0xeaddc6);
    this.label("04 / LEARNING LAB", 16, 6.7, 9.3, 10);
    // Contact stop: mailbox plaza at the north end of the main road.
    this.cylinder(0, 0.04, -25, 4.5, 0.15, 0xe4cb96, 32);
    this.box(0, 1.15, -26, 0.4, 2.3, 0.4, 0x877c60);
    this.box(0, 2.3, -26, 2.5, 1.3, 1.5, 0xe5a947);
    this.box(0, 2.4, -25.22, 1.5, 0.12, 0.08, 0x866027);
    this.label("05 / SAY HELLO", 0, 4.8, -26, 9);
    this.obstacles.push({ x: 0, z: -26, halfX: 1.4, halfZ: 0.9 });
    // A startup pad, perimeter greenery, rocks and lamps make the route readable.
    this.label("MINH’S LITTLE WORLD", 0, 0.7, 23, 11, "#4c6257", "#fff6df");
    const trees = [
      [-26, -23, 1.2],
      [-22, -25, 0.9],
      [-27, -18, 1],
      [-7, -23, 1.2],
      [7, -25, 1.3],
      [24, -22, 1.1],
      [27, -17, 1.3],
      [26, -3, 1],
      [-25, 0, 1.2],
      [-26, 17, 1.3],
      [-22, 24, 1.1],
      [-10, 24, 0.9],
      [10, 24, 1.2],
      [25, 23, 1.4],
      [27, 12, 1],
      [7, 4, 0.8],
      [-8, 3, 1.1],
      [-7, 7, 0.8],
      [8, 7, 1.1],
    ];
    trees.forEach(([x, z, s], i) =>
      this.tree(x, z, s, i % 3 === 0 ? 0x8b9e68 : 0x6e916a),
    );
    for (const x of [-25, 25])
      for (let z = -10; z <= 15; z += 12) {
        this.cylinder(x, 1.8, z, 0.09, 3.6, 0x747967, 8);
        this.box(x, 3.7, z, 0.65, 0.4, 0.65, 0xfaf0ce);
      }
    for (const [x, z] of [
      [-7, -14],
      [7, -15],
      [-25, 20],
      [23, 3],
    ]) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.8, 0),
        this.mat(0xaba58b),
      );
      rock.position.set(x, 0.35, z);
      rock.scale.set(1.3, 0.6, 1);
      this.scene.add(rock);
    }
    for (const stop of stops) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(2.2, 2.5, 48),
        new THREE.MeshBasicMaterial({
          color: stop.color,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(stop.x, 0.03, stop.z);
      this.scene.add(ring);
      this.markerRings.push(ring);
      this.cylinder(stop.x - 3, 0.95, stop.z, 0.07, 1.9, 0x8d8169, 7);
      this.label(
        stop.number,
        stop.x - 3,
        2.3,
        stop.z,
        1.7,
        stop.color,
        "#263e35",
      );
    }
    // Simple fences along the outer sides.
    for (const x of [-30, 30]) {
      for (let z = -27; z <= 26; z += 4)
        this.box(x, 0.5, z, 0.14, 1, 0.14, 0xac956e);
      this.box(x, 0.5, -0.5, 0.12, 0.13, 54, 0xac956e);
    }
  }
  private building(
    x: number,
    z: number,
    color: number,
    w: number,
    h: number,
    d: number,
  ) {
    this.box(x, h / 2, z, w, h, d, color);
    this.box(x, 0.15, z, w + 0.55, 0.3, d + 0.55, 0xded0ae);
    this.obstacles.push({ x, z, halfX: w / 2 + 0.15, halfZ: d / 2 + 0.15 });
  }
  private addDetails() {
    // Individually authored model details: eaves, window frames, benches, vents, pots and paths.
    const palette = [0xd39064, 0x739f8e, 0x92ad72, 0xaa97b4];
    const centers = [
      [-16, -14],
      [16, -14],
      [-16, 9.2],
      [16, 9.3],
    ];
    centers.forEach(([x, z], i) => {
      const front = z + (i < 2 ? 2.6 : 2.4);
      this.box(x, 0.2, front + 0.8, 7.5, 0.25, 1.65, 0xc7bda1);
      // Door and overhang on the small garden/lab facades.
      if (i >= 2) {
        this.box(x, 1.3, front, 1.3, 2.5, 0.13, 0x536d5b);
        this.box(x, 1.6, front + 0.1, 0.9, 1.3, 0.05, 0xa9c4b3);
        this.box(x + 0.45, 0.9, front + 0.17, 0.1, 0.12, 0.1, 0xe8d4a5);
      }
      for (const side of [-1, 1]) {
        this.cylinder(x + side * 3.8, 0.36, front, 0.37, 0.64, 0xb77950, 10);
        const bush = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.58, 1),
          this.mat(i === 3 ? 0x98a16e : 0x6e905b),
        );
        bush.position.set(x + side * 3.8, 0.95, front);
        bush.castShadow = true;
        this.scene.add(bush);
      }
      // Side-wall details catch the afternoon light.
      for (let j = 0; j < 3; j++) {
        this.box(x + 3.54, 2.4, z - 1.2 + j * 1.2, 0.09, 1.25, 0.85, 0x53756a);
        this.box(x + 3.62, 2.4, z - 1.2 + j * 1.2, 0.06, 0.07, 0.85, 0xbad1b5);
      }
      if (i === 0) {
        for (let j = 0; j < 3; j++) {
          this.box(x - 2.5 + j * 2.5, 4.9, z, 2.05, 0.08, 3.6, 0x314f58);
          for (let n = -1; n <= 1; n++)
            this.box(
              x - 2.5 + j * 2.5,
              4.96,
              z + n,
              0.025,
              0.025,
              3.4,
              0x8ca9ac,
            );
        }
      }
      if (i === 1) {
        this.box(x + 2, 6.13, z, 1.3, 0.8, 1.5, 0x97b6a1);
        for (let j = 0; j < 4; j++)
          this.box(x + 2, 6.56, z - 0.5 + j * 0.3, 1.1, 0.03, 0.06, 0x486f61);
      }
    });
    // Garden beds, tiny flowers and seats around the neighborhoods.
    for (const [x, z] of [
      [-10, -18],
      [23, -10],
      [-23, 13],
      [10, 12],
    ]) {
      this.box(x, 0.35, z, 2.1, 0.25, 0.75, 0xa98e61);
      for (const dx of [-0.8, 0.8])
        this.box(x + dx, 0.18, z, 0.12, 0.35, 0.65, 0x647c61);
      this.box(x, 0.85, z - 0.35, 2.1, 0.22, 0.16, 0xa98e61);
    }
    for (let i = 0; i < 28; i++) {
      const angle = i * 2.399,
        radius = 2 + (i % 5) * 0.32;
      const cx = i < 14 ? -7 : 7,
        cz = i < 14 ? 4 : -17;
      const x = cx + Math.cos(angle) * radius,
        z = cz + Math.sin(angle) * radius;
      this.cylinder(x, 0.17, z, 0.035, 0.3, 0x7f9a59, 5);
      const flower = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.15, 0),
        this.mat(i % 3 === 0 ? 0xe6b752 : 0xe8d8bd),
      );
      flower.position.set(x, 0.34, z);
      this.scene.add(flower);
    }
    // Roadside directional stripes and a pair of safety cones at the garage.
    for (const x of [-19.5, -12.5]) {
      this.box(x, 0.045, -10.2, 0.65, 0.09, 0.65, 0x9b8867);
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.23, 0.65, 8),
        this.mat(0xdc8950),
      );
      cone.position.set(x, 0.42, -10.2);
      cone.castShadow = true;
      this.scene.add(cone);
    }
  }
  private createCar() {
    const v = this.vehicle;
    this.box(0, 0.72, 0, 1.6, 0.55, 2.65, 0xe87846, v);
    this.box(0, 1.12, -0.15, 1.35, 0.55, 1.35, 0xf49a61, v);
    this.box(0, 1.2, 0.55, 1.2, 0.36, 0.05, 0x47686a, v);
    this.box(0, 1.2, -0.83, 1.2, 0.36, 0.06, 0x47686a, v);
    this.box(0, 1.47, -0.15, 1.45, 0.16, 1.5, 0xffd799, v);
    for (const x of [-0.81, 0.81]) {
      this.box(x, 1.17, -0.16, 0.04, 0.36, 1.1, 0x496b6b, v);
      for (const z of [-0.83, 0.85]) {
        const wheel = this.cylinder(x, 0.43, z, 0.39, 0.26, 0x343e38, 12, v);
        wheel.rotation.z = Math.PI / 2;
        this.wheels.push(wheel);
        this.cylinder(
          x * 1.12,
          0.43,
          z,
          0.18,
          0.02,
          0xc8b98f,
          10,
          v,
        ).rotation.z = Math.PI / 2;
      }
    }
    for (const x of [-0.53, 0.53]) {
      this.box(x, 0.79, 1.34, 0.3, 0.21, 0.08, 0xffefb0, v);
      this.box(x, 0.79, -1.34, 0.27, 0.2, 0.08, 0xa73e35, v);
    }
    this.box(0, 0.5, 1.43, 1.5, 0.16, 0.13, 0xc9c4af, v);
    this.box(0, 0.52, -1.43, 1.5, 0.16, 0.13, 0xc9c4af, v);
    // Roof rack, a parcel, mirrors and a small antenna give the car its own identity.
    this.box(0, 1.61, -0.15, 1.18, 0.08, 1.2, 0x536558, v);
    for (const x of [-0.55, 0.55])
      this.box(x, 1.74, -0.15, 0.065, 0.2, 1.2, 0x536558, v);
    this.box(-0.17, 1.88, -0.2, 0.61, 0.46, 0.7, 0xd6aa68, v);
    this.box(-0.17, 2.12, -0.2, 0.09, 0.025, 0.72, 0xf8ddb1, v);
    for (const x of [-0.88, 0.88])
      this.box(x, 1.11, 0.39, 0.22, 0.2, 0.26, 0xede0b2, v);
    this.cylinder(0.56, 1.83, -0.64, 0.018, 0.65, 0x414e42, 5, v);
    this.scene.add(v);
    const dot = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 1.72, 40),
      new THREE.MeshBasicMaterial({
        color: 0xc87147,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      }),
    );
    dot.rotation.x = -Math.PI / 2;
    dot.position.y = 0.025;
    v.add(dot);
  }
  private createPackets() {
    packetLocations.forEach(([x, z], i) => {
      const group = new THREE.Group();
      const coin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 0.17, 6),
        this.mat(0xf4ba45, 0.35),
      );
      coin.rotation.x = Math.PI / 2;
      group.add(coin);
      const center = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.22, 0.19),
        this.mat(0xffedaf),
      );
      group.add(center);
      group.position.set(x, 1, z);
      group.visible = !this.collected.has(i);
      this.scene.add(group);
      this.packets.push(group);
    });
  }
  private createEffects() {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    for (let i = 0; i < 52; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: 0xf6cc79,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 1,
        scale: 0.1,
      });
    }
    this.arrivalRing.rotation.x = -Math.PI / 2;
    this.arrivalRing.position.y = 0.09;
    this.scene.add(this.arrivalRing);
  }
  private burst(
    x: number,
    z: number,
    color: string | number,
    count = 16,
    dust = false,
  ) {
    if (this.reducedMotion.matches) return;
    for (let i = 0; i < count; i++) {
      const particle =
        this.particles[this.burstCursor++ % this.particles.length];
      const angle = (i / count) * Math.PI * 2 + this.clock * 0.8;
      particle.life = particle.maxLife = dust ? 0.5 : 1.2;
      particle.scale = dust ? 0.18 : 0.1 + (i % 3) * 0.055;
      particle.mesh.position.set(x, dust ? 0.12 : 0.9, z);
      particle.velocity.set(
        Math.cos(angle) * (dust ? 0.7 : 2.4),
        dust ? 0.45 : 1.4 + (i % 4) * 0.55,
        Math.sin(angle) * (dust ? 0.7 : 2.4),
      );
      (particle.mesh.material as THREE.MeshBasicMaterial).color.set(color);
      particle.mesh.visible = true;
    }
  }
  private animateEffects(dt: number) {
    for (const particle of this.particles) {
      if (particle.life <= 0) continue;
      particle.life -= dt;
      particle.mesh.visible = particle.life > 0;
      particle.mesh.position.addScaledVector(particle.velocity, dt);
      particle.velocity.y -= dt * 1.2;
      const ratio = Math.max(0, particle.life / particle.maxLife);
      particle.mesh.scale.setScalar(particle.scale * (0.4 + ratio));
      particle.mesh.rotation.y += dt * 2;
      (particle.mesh.material as THREE.MeshBasicMaterial).opacity =
        ratio * 0.85;
    }
    this.arrivalAge += dt;
    const arrivalProgress = Math.min(1, this.arrivalAge / 1.2);
    this.arrivalRing.scale.setScalar(1 + arrivalProgress * 2.8);
    (this.arrivalRing.material as THREE.MeshBasicMaterial).opacity = this
      .reducedMotion.matches
      ? 0
      : (1 - arrivalProgress) * 0.9;
  }
  private tweenCamera(
    target: THREE.Vector3,
    offset: THREE.Vector3,
    zoom: number,
    duration: number,
    done?: () => void,
  ) {
    this.cameraTween = {
      started: this.clock,
      duration: this.reducedMotion.matches ? 0 : duration,
      fromTarget: this.cameraTarget.clone(),
      toTarget: target,
      fromOffset: this.camera.position.clone().sub(this.cameraTarget),
      toOffset: offset,
      fromZoom: this.camera.zoom,
      toZoom: zoom,
      done,
    };
    this.start();
  }
  private animateCamera() {
    if (!this.cameraTween) return;
    const t = this.cameraTween;
    const p =
      t.duration === 0 ? 1 : Math.min(1, (this.clock - t.started) / t.duration);
    const ease = p * p * p * (p * (p * 6 - 15) + 10);
    this.cameraTarget.lerpVectors(t.fromTarget, t.toTarget, ease);
    this.camera.position
      .copy(t.fromOffset)
      .lerp(t.toOffset, ease)
      .add(this.cameraTarget);
    this.camera.zoom = THREE.MathUtils.lerp(t.fromZoom, t.toZoom, ease);
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.cameraTarget);
    if (p === 1) {
      this.cameraTween = null;
      t.done?.();
    }
  }
  public enterStop(id: StopId, done: () => void) {
    const stop = stops.find((s) => s.id === id)!;
    this.focusedStop = id;
    this.paused = true;
    this.clearInput();
    this.arrivalAge = 0;
    this.arrivalRing.position.set(stop.x, 0.09, stop.z);
    (this.arrivalRing.material as THREE.MeshBasicMaterial).color.set(
      stop.color,
    );
    this.burst(stop.x, stop.z, stop.color, 25);
    const target = new THREE.Vector3(stop.x, 0.7, stop.z - 3.5);
    const offset = new THREE.Vector3(22, 30, 34);
    this.tweenCamera(
      target,
      offset,
      this.container.clientWidth < 760 ? 1.14 : 1.36,
      1.15,
      done,
    );
  }
  public finishEntry() {
    if (!this.cameraTween || !this.focusedStop) return;
    this.cameraTween.duration = 0;
    this.animateCamera();
    this.renderer.render(this.scene, this.camera);
  }
  public leaveStop() {
    this.focusedStop = null;
    this.tweenCamera(
      new THREE.Vector3(this.car.x * 0.7, 0, this.car.z * 0.7 - 2),
      new THREE.Vector3(30, 40, 34),
      1,
      0.8,
    );
  }
  private keyDown = (e: KeyboardEvent) => {
    if (
      this.paused ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      (e.target instanceof HTMLElement &&
        e.target.closest('input,textarea,[role="dialog"]'))
    )
      return;
    const keys: Record<string, keyof DriveInput> = {
      w: "forward",
      arrowup: "forward",
      s: "reverse",
      arrowdown: "reverse",
      a: "left",
      arrowleft: "left",
      d: "right",
      arrowright: "right",
      " ": "brake",
    };
    const key = e.key.toLowerCase();
    if (
      (key === " " || key === "enter") &&
      e.target instanceof HTMLElement &&
      e.target.closest("button,a")
    )
      return;
    if (keys[key]) {
      e.preventDefault();
      this.input[keys[key]] = true;
    }
    if ((key === "e" || key === "enter") && !e.repeat && this.nearby) {
      e.preventDefault();
      this.callbacks.onInteract(this.nearby);
    }
    if (key === "r" && !e.repeat) this.respawn();
  };
  private keyUp = (e: KeyboardEvent) => {
    const keys: Record<string, keyof DriveInput> = {
      w: "forward",
      arrowup: "forward",
      s: "reverse",
      arrowdown: "reverse",
      a: "left",
      arrowleft: "left",
      d: "right",
      arrowright: "right",
      " ": "brake",
    };
    if (keys[e.key.toLowerCase()])
      this.input[keys[e.key.toLowerCase()]] = false;
  };
  private clearInput = () => {
    this.input = {
      forward: false,
      reverse: false,
      left: false,
      right: false,
      brake: false,
    };
    this.car.speed = 0;
  };
  private visibility = () => {
    if (document.hidden) {
      this.clearInput();
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    } else this.start();
  };
  private contextLost = (event: Event) => {
    event.preventDefault();
    this.cameraTween = null;
    this.pause(true);
    this.callbacks.onError();
  };
  private worldPointerDown = () => {
    this.pointerDown = true;
  };
  private worldPointerUp = (event: PointerEvent) => {
    if (!this.pointerDown || this.paused) return;
    this.pointerDown = false;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(pointer, this.camera);
    const hit = ray.intersectObjects(this.markerRings);
    if (hit.length) {
      const i = this.markerRings.indexOf(hit[0].object as THREE.Mesh);
      if (i >= 0 && this.nearby === stops[i].id)
        this.callbacks.onInteract(stops[i].id);
    }
  };
  public setInput(key: keyof DriveInput, value: boolean) {
    if (this.paused || this.focusedStop) return;
    this.input[key] = value;
  }
  public pause(value: boolean) {
    this.paused = value;
    this.clearInput();
    if (value && !this.cameraTween) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    } else this.start();
  }
  public respawn() {
    const distance = this.car.distance;
    this.car = { ...initialCar, distance };
    this.clearInput();
    this.focusedStop = null;
    this.tweenCamera(
      new THREE.Vector3(this.car.x * 0.7, 0, this.car.z * 0.7 - 2),
      new THREE.Vector3(30, 40, 34),
      1,
      0.8,
    );
    this.update(0);
    this.renderer.render(this.scene, this.camera);
  }
  public teleport(id: StopId) {
    const stop = stops.find((s) => s.id === id)!;
    this.car = {
      x: stop.x,
      z: stop.z + 0.3,
      heading: Math.PI,
      speed: 0,
      distance: this.car.distance,
    };
    this.clearInput();
    this.focusedStop = null;
    this.arrivalAge = 0;
    this.arrivalRing.position.set(stop.x, 0.09, stop.z);
    (this.arrivalRing.material as THREE.MeshBasicMaterial).color.set(
      stop.color,
    );
    this.tweenCamera(
      new THREE.Vector3(this.car.x * 0.7, 0, this.car.z * 0.7 - 2),
      new THREE.Vector3(30, 40, 34),
      1,
      0.8,
    );
    this.update(0);
    this.renderer.render(this.scene, this.camera);
  }
  private resize = () => {
    const w = this.container.clientWidth,
      h = this.container.clientHeight,
      aspect = w / Math.max(h, 1);
    const span = 25;
    this.camera.left = -span * aspect;
    this.camera.right = span * aspect;
    this.camera.top = span;
    this.camera.bottom = -span;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.render(this.scene, this.camera);
  };
  private update(dt: number) {
    if (!this.paused && !this.focusedStop)
      this.car = stepCar(this.car, this.input, dt, this.obstacles);
    const { x, z, heading } = this.car;
    const moving = !this.paused && !this.reducedMotion.matches;
    this.vehicle.position.set(
      x,
      moving
        ? Math.sin(this.clock * 15) *
            Math.min(Math.abs(this.car.speed) * 0.0025, 0.025)
        : 0,
      z,
    );
    this.vehicle.rotation.y = heading;
    this.vehicle.rotation.z = THREE.MathUtils.lerp(
      this.vehicle.rotation.z,
      moving
        ? (Number(this.input.left) - Number(this.input.right)) *
            this.car.speed *
            0.003
        : 0,
      Math.min(1, dt * 8),
    );
    if (
      moving &&
      Math.abs(this.car.speed) > 3 &&
      this.clock - this.dustAt > 0.1
    ) {
      this.dustAt = this.clock;
      this.burst(
        x - Math.sin(heading) * 1.25,
        z - Math.cos(heading) * 1.25,
        0xb8ad8c,
        2,
        true,
      );
    }
    for (const wheel of this.wheels)
      wheel.rotation.x -= this.car.speed * dt * 2.3;
    if (!this.cameraTween && !this.focusedStop) {
      this.carFocus.set(x * 0.7, 0, z * 0.7 - 2);
      this.cameraTarget.lerp(
        this.carFocus,
        this.reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 3.3),
      );
      this.camera.position
        .copy(this.cameraTarget)
        .add(new THREE.Vector3(30, 40, 34));
      this.camera.lookAt(this.cameraTarget);
    }
    let near: StopId | null = null;
    for (const stop of stops)
      if (Math.hypot(stop.x - x, stop.z - z) < 3.5) near = stop.id;
    this.nearby = near;
    this.packets.forEach((packet, i) => {
      if (this.collected.has(i)) {
        packet.visible = false;
        return;
      }
      if (
        !this.paused &&
        Math.hypot(packet.position.x - x, packet.position.z - z) < 1.35
      ) {
        this.collected.add(i);
        packet.visible = false;
        this.burst(packet.position.x, packet.position.z, 0xeab955, 14);
        this.callbacks.onPacket(i);
      } else if (!this.reducedMotion.matches) {
        packet.rotation.y = this.clock * 1.5 + i;
        packet.position.y = 1.1 + Math.sin(this.clock * 2 + i) * 0.15;
      }
    });
    this.markerRings.forEach((ring, i) => {
      const active = near === stops[i].id;
      const pulse = this.reducedMotion.matches
        ? 0
        : Math.sin(this.clock * 2.8) * 0.04;
      ring.scale.setScalar(active ? 1.07 + pulse : 1);
      (ring.material as THREE.MeshBasicMaterial).opacity = active
        ? 0.8 + pulse * 3
        : 0.48;
    });
    this.animateEffects(dt);
    if (this.clock - this.lastUi > 0.08 || dt === 0) {
      this.lastUi = this.clock;
      this.callbacks.onUpdate({ ...this.car, nearby: near });
    }
  }
  private tick = (now: number) => {
    this.raf = 0;
    if (this.disposed || (this.paused && !this.cameraTween) || document.hidden)
      return;
    const dt = Math.min((now - this.last) / 1000, 0.04);
    this.last = now;
    this.clock += dt;
    this.update(dt);
    this.animateCamera();
    this.renderer.render(this.scene, this.camera);
    if (!this.paused || this.cameraTween)
      this.raf = requestAnimationFrame(this.tick);
  };
  private start() {
    if (
      !this.raf &&
      (!this.paused || this.cameraTween) &&
      !this.disposed &&
      !document.hidden
    ) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }
  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    window.removeEventListener("keydown", this.keyDown);
    window.removeEventListener("keyup", this.keyUp);
    window.removeEventListener("blur", this.clearInput);
    document.removeEventListener("visibilitychange", this.visibility);
    this.renderer.domElement.removeEventListener(
      "webglcontextlost",
      this.contextLost,
    );
    this.renderer.domElement.removeEventListener(
      "pointerdown",
      this.worldPointerDown,
    );
    this.renderer.domElement.removeEventListener(
      "pointerup",
      this.worldPointerUp,
    );
    const geometry = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>(),
      textures = new Set<THREE.Texture>();
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) geometry.add(mesh.geometry);
      if (mesh.material)
        (Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material]
        ).forEach((m) => {
          materials.add(m);
          const map = (m as THREE.MeshStandardMaterial).map;
          if (map) textures.add(map);
        });
    });
    geometry.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
