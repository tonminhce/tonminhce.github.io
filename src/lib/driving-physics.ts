export interface CarState {
  x: number;
  z: number;
  heading: number;
  speed: number;
  distance: number;
}
export interface DriveInput {
  forward: boolean;
  reverse: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
}
export interface Obstacle {
  x: number;
  z: number;
  halfX: number;
  halfZ: number;
}
export function stepCar(
  car: CarState,
  input: DriveInput,
  dt: number,
  obstacles: readonly Obstacle[],
): CarState {
  dt = Math.max(0, Math.min(dt, 0.04));
  const throttle = Number(input.forward) - Number(input.reverse);
  let speed = car.speed + throttle * 13 * dt;
  speed *= Math.exp(-(input.brake ? 9 : throttle ? 0.5 : 2.2) * dt);
  speed = Math.max(-6, Math.min(13, speed));
  if (Math.abs(speed) < 0.025) speed = 0;
  const steering = Number(input.left) - Number(input.right);
  const heading = car.heading + steering * 1.95 * dt * (speed / 10);
  let x = car.x + Math.sin(heading) * speed * dt;
  let z = car.z + Math.cos(heading) * speed * dt;
  const radius = 0.82;
  let collided = false;
  for (const box of obstacles) {
    const nearX = Math.max(box.x - box.halfX, Math.min(x, box.x + box.halfX));
    const nearZ = Math.max(box.z - box.halfZ, Math.min(z, box.z + box.halfZ));
    const dx = x - nearX,
      dz = z - nearZ;
    if (dx * dx + dz * dz < radius * radius) {
      collided = true;
      const length = Math.hypot(dx, dz);
      if (length > 0.0001) {
        x = nearX + (dx / length) * radius;
        z = nearZ + (dz / length) * radius;
      } else {
        x = car.x;
        z = car.z;
      }
    }
  }
  const clampedX = Math.max(-29, Math.min(29, x)),
    clampedZ = Math.max(-29, Math.min(27, z));
  if (clampedX !== x || clampedZ !== z) collided = true;
  x = clampedX;
  z = clampedZ;
  return {
    x,
    z,
    heading,
    speed: collided ? -speed * 0.12 : speed,
    distance: car.distance + Math.hypot(x - car.x, z - car.z),
  };
}
export const initialCar: CarState = {
  x: 0,
  z: 11,
  heading: Math.PI,
  speed: 0,
  distance: 0,
};
