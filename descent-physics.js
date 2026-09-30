export const GRAVITY = 650;
const LIFT = 190;

export function launch(cat, target) {
  const distance = target.y - cat.y;
  // Clear an upper ledge by the same small arc used for a downward jump.
  const lift = Math.sqrt(LIFT * LIFT + 2 * GRAVITY * Math.max(0, -distance));
  const seconds = (lift + Math.sqrt(lift * lift + 2 * GRAVITY * distance)) / GRAVITY;
  return { ...cat, vx: (target.x - cat.x) / seconds, vy: -lift, ignore: cat.grounded, grounded: null, landingY: target.y };
}

export function step(cat, seconds, direction, ledges, width) {
  const next = { ...cat };
  if (next.grounded !== null) {
    next.x += direction * 205 * seconds;
    const ledge = ledges[next.grounded];
    if (Math.abs(next.x - ledge.x) <= ledge.width / 2 + 5) return next;
    next.ignore = next.grounded;
    next.landingY = undefined;
    next.grounded = null;
    next.vy = 0;
    next.vx = direction * 205;
  }
  if (direction) next.vx = direction * 260;
  next.x = Math.max(18, Math.min(width - 18, next.x + next.vx * seconds));
  const previousY = next.y;
  next.y += next.vy * seconds + .5 * GRAVITY * seconds * seconds;
  next.vy += GRAVITY * seconds;
  if (next.vy >= 0) {
    // Pass through ledges while rising; land on the requested row on descent.
    const sourceY = ledges[next.ignore]?.y ?? -Infinity;
    const landing = ledges.findIndex(ledge =>
      (next.landingY === undefined ? ledge.y > sourceY : ledge.y === next.landingY) &&
      previousY <= ledge.y && next.y >= ledge.y && Math.abs(next.x - ledge.x) <= ledge.width / 2 + 10);
    if (landing !== -1) {
      next.y = ledges[landing].y;
      next.vx = 0;
      next.vy = 0;
      next.grounded = landing;
      next.landingY = undefined;
    }
  }
  return next;
}
