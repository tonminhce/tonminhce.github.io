"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { TOUCH } from "three";

export function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const control = useRef({ paused: false, reset: () => {} });
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let cleanup = () => {};
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    control.current.paused = preference.matches;
    setPaused(preference.matches);
    const syncMotion = () => {
      control.current.paused = preference.matches;
      setPaused(preference.matches);
      mount.dispatchEvent(new Event("motionchange"));
    };
    preference.addEventListener("change", syncMotion);
    Promise.all([
      import("three"),
      import("three/examples/jsm/controls/OrbitControls.js"),
    ])
      .then(([THREE, { OrbitControls }]) => {
        if (disposed) return;
        let renderer: InstanceType<typeof THREE.WebGLRenderer>;
        try {
          renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "low-power",
          });
        } catch {
          setFailed(true);
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
        renderer.setClearColor(0x111313, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.35;
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.style.touchAction = "pan-y";
        mount.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        camera.position.set(7.3, 5.3, 8.8);
        const orbit = new OrbitControls(camera, renderer.domElement);
        orbit.enableZoom = false;
        orbit.enablePan = false;
        orbit.enableDamping = false;
        orbit.minPolarAngle = 0.35;
        orbit.maxPolarAngle = Math.PI / 2;
        // Preserve one-finger vertical page scrolling on touch screens.
        orbit.touches.ONE = null as unknown as TOUCH;
        orbit.touches.TWO = THREE.TOUCH.ROTATE;
        orbit.update();
        orbit.saveState();
        control.current.reset = () => {
          orbit.reset();
          cluster.rotation.y = 0;
        };
        scene.add(new THREE.AmbientLight(0xf3e4d1, 2.4));
        const key = new THREE.DirectionalLight(0xffc699, 5);
        key.position.set(3, 7, 5);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xa5bec5, 3.5);
        rim.position.set(-6, 2, -4);
        scene.add(rim);
        const coreLight = new THREE.PointLight(0xff6b32, 22, 9);
        coreLight.position.set(0, 0, 1);
        scene.add(coreLight);
        const cluster = new THREE.Group();
        scene.add(cluster);
        const darkMaterial = new THREE.MeshStandardMaterial({
          color: 0x343c3d,
          metalness: 0.72,
          roughness: 0.34,
        });
        const coreMaterial = new THREE.MeshStandardMaterial({
          color: 0xff793f,
          emissive: 0xff501f,
          emissiveIntensity: 1.15,
          metalness: 0.2,
          roughness: 0.4,
        });
        const blockGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        const coreGeometry = new THREE.BoxGeometry(0.84, 0.84, 0.84);
        const edgeGeometry = new THREE.EdgesGeometry(blockGeometry);
        const edgeMaterial = new THREE.LineBasicMaterial({
          color: 0x7a8b8b,
          transparent: true,
          opacity: 0.58,
        });
        const copperMaterial = new THREE.LineBasicMaterial({
          color: 0xfe9663,
          transparent: true,
          opacity: 0.7,
        });
        const positions: InstanceType<typeof THREE.Vector3>[] = [];
        for (let x = -1; x <= 1; x++)
          for (let y = -1; y <= 1; y++)
            for (let z = -1; z <= 1; z++) {
              const isCore = x === 0 && y === 0 && z === 0;
              // Open the front of the lattice to reveal the orange core.
              if (!isCore && x === 0 && z === 1) continue;
              const position = new THREE.Vector3(x * 1.25, y * 1.25, z * 1.25);
              const mesh = new THREE.Mesh(
                isCore ? coreGeometry : blockGeometry,
                isCore ? coreMaterial : darkMaterial,
              );
              mesh.position.copy(position);
              cluster.add(mesh);
              if (!isCore) {
                const edges = new THREE.LineSegments(
                  edgeGeometry,
                  edgeMaterial,
                );
                edges.position.copy(position);
                cluster.add(edges);
                positions.push(position);
              }
            }
        const connectionPoints: InstanceType<typeof THREE.Vector3>[] = [];
        for (let i = 0; i < positions.length; i++)
          for (let j = i + 1; j < positions.length; j++) {
            if (Math.abs(positions[i].distanceTo(positions[j]) - 1.25) < 0.01)
              connectionPoints.push(positions[i], positions[j]);
          }
        const connections = new THREE.BufferGeometry().setFromPoints(
          connectionPoints,
        );
        cluster.add(new THREE.LineSegments(connections, copperMaterial));
        const outerGeometry = new THREE.EdgesGeometry(
          new THREE.BoxGeometry(4.45, 4.45, 4.45),
        );
        const outerMaterial = new THREE.LineBasicMaterial({
          color: 0x718181,
          transparent: true,
          opacity: 0.22,
        });
        cluster.add(new THREE.LineSegments(outerGeometry, outerMaterial));
        const grid = new THREE.GridHelper(15, 30, 0x374141, 0x232a2a);
        grid.position.y = -2.55;
        scene.add(grid);
        const particleGeometry = new THREE.SphereGeometry(0.035, 6, 6);
        const particleMaterial = new THREE.MeshBasicMaterial({
          color: 0xffa671,
        });
        const particles = Array.from({ length: 12 }, (_, i) => {
          const mesh = new THREE.Mesh(particleGeometry, particleMaterial);
          cluster.add(mesh);
          return { mesh, path: (i * 6) % (connectionPoints.length / 2) };
        });
        let visible = true,
          raf = 0,
          elapsed = 0,
          previous = performance.now();
        const resize = () => {
          const width = mount.clientWidth,
            height = mount.clientHeight;
          renderer.setSize(width, height);
          camera.aspect = width / Math.max(height, 1);
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(mount);
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible) start();
        });
        observer.observe(mount);
        function tick(now: number) {
          raf = 0;
          const delta = Math.min((now - previous) / 1000, 0.05);
          previous = now;
          if (disposed || document.hidden || !visible) return;
          if (!control.current.paused) {
            elapsed += delta;
            cluster.rotation.y += delta * 0.07;
            for (const { mesh, path } of particles)
              mesh.position.lerpVectors(
                connectionPoints[path * 2],
                connectionPoints[path * 2 + 1],
                (elapsed * 0.35 + path * 0.13) % 1,
              );
          }
          renderer.render(scene, camera);
          if (!control.current.paused) raf = requestAnimationFrame(tick);
        }
        function start() {
          if (!raf && !disposed) {
            previous = performance.now();
            raf = requestAnimationFrame(tick);
          }
        }
        const onChange = () => {
          renderer.render(scene, camera);
          start();
        };
        orbit.addEventListener("change", onChange);
        const resume = () => start();
        document.addEventListener("visibilitychange", resume);
        mount.addEventListener("motionchange", resume);
        const onLost = (event: Event) => {
          event.preventDefault();
          setFailed(true);
          cancelAnimationFrame(raf);
        };
        renderer.domElement.addEventListener("webglcontextlost", onLost);
        resize();
        start();
        setReady(true);
        cleanup = () => {
          cancelAnimationFrame(raf);
          resizeObserver.disconnect();
          observer.disconnect();
          orbit.dispose();
          document.removeEventListener("visibilitychange", resume);
          mount.removeEventListener("motionchange", resume);
          renderer.domElement.removeEventListener("webglcontextlost", onLost);
          const geometries = new Set<
            InstanceType<typeof THREE.BufferGeometry>
          >();
          const materials = new Set<InstanceType<typeof THREE.Material>>();
          scene.traverse((object) => {
            const item = object as InstanceType<typeof THREE.Mesh>;
            if (item.geometry) geometries.add(item.geometry);
            if (item.material)
              (Array.isArray(item.material)
                ? item.material
                : [item.material]
              ).forEach((m) => materials.add(m));
          });
          geometries.forEach((g) => g.dispose());
          materials.forEach((m) => m.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
      cleanup();
      preference.removeEventListener("change", syncMotion);
    };
  }, []);
  function toggleMotion() {
    const next = !paused;
    setPaused(next);
    control.current.paused = next;
    mountRef.current?.dispatchEvent(new Event("motionchange"));
  }
  return (
    <div className={`hero-visual ${ready && !failed ? "scene-ready" : ""}`}>
      <div className="scene-topline">
        <span>THE SYSTEM BENEATH</span>
        <span>FIG. 001</span>
      </div>
      <div className="scene-canvas" ref={mountRef} />
      {(!ready || failed) && (
        <div className="scene-fallback">
          <span className="fallback-symbol">[ m. ]</span>
          <span>JAVA / GO / DISTRIBUTED SYSTEMS</span>
        </div>
      )}
      <div className="scene-label label-top">
        <span className="label-cross">+</span>
        <div>
          INDEPENDENT SERVICES<small>Connected by design.</small>
        </div>
      </div>
      <div className="scene-label label-bottom">
        <span className="label-cross">+</span>
        <div>
          ONE CONNECTED CORE<small>Built for what comes next.</small>
        </div>
      </div>
      <div className="scene-toolbar">
        <span className="scene-hint">
          {failed
            ? "SYSTEMS, IN PERSPECTIVE"
            : "DRAG TO ROTATE · TWO FINGERS ON TOUCH"}
        </span>
        <div>
          <button
            onClick={() => control.current.reset()}
            aria-label="Reset 3D view"
            disabled={!ready || failed}
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={toggleMotion}
            aria-label={paused ? "Play 3D animation" : "Pause 3D animation"}
            aria-pressed={paused}
            disabled={!ready || failed}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
