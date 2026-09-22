// Lightweight, decorative pointer particles. The native pointer and links remain untouched.
export function startLeafTrail(reducedMotion) {
  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-leaves';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  document.body.append(canvas);

  const colors = ['#6d855b', '#8b9866', '#42644e', '#b19a62'];
  let leaves = [], frame = null, previous = 0, last = null, width = 0, height = 0;
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = document.documentElement.clientWidth;
    height = innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; leaves = []; last = null;
    ctx.clearRect(0, 0, width, height);
  }
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('blur', stop);
  document.addEventListener('pointerleave', () => { last = null; });

  function drawLeaf(leaf) {
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.angle);
    ctx.scale(leaf.size, leaf.size);
    ctx.globalAlpha = .8 * Math.max(0, Math.min(1, (leaf.life - leaf.age) / .65));
    ctx.fillStyle = leaf.color;
    ctx.beginPath();
    ctx.moveTo(0, -1);
    ctx.bezierCurveTo(.84, -.55, .64, .47, 0, 1);
    ctx.bezierCurveTo(-.68, .42, -.61, -.52, 0, -1);
    ctx.fill();
    ctx.strokeStyle = '#ded0a0';
    ctx.lineWidth = .06;
    ctx.beginPath();
    ctx.moveTo(0, .98); ctx.quadraticCurveTo(.1, 0, 0, -.87);
    for (const y of [-.4, 0, .4]) {
      ctx.moveTo(.03, y + .12); ctx.lineTo(.35, y - .13);
      ctx.moveTo(.03, y + .08); ctx.lineTo(-.3, y - .13);
    }
    ctx.stroke();
    ctx.restore();
  }
  function tick(now) {
    const dt = Math.min((now - previous) / 1000, .05);
    previous = now;
    ctx.clearRect(0, 0, width, height);
    leaves = leaves.filter(leaf => leaf.age < leaf.life);
    for (const leaf of leaves) {
      leaf.age += dt;
      leaf.x += (leaf.vx + Math.sin(leaf.age * 3 + leaf.phase) * 12) * dt;
      leaf.y += leaf.vy * dt;
      leaf.vy += 10 * dt;
      leaf.angle += leaf.spin * dt;
      drawLeaf(leaf);
    }
    frame = leaves.length ? requestAnimationFrame(tick) : null;
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || reducedMotion.matches || document.hidden) return;
    const now = performance.now();
    if (last && (now - last.time < 34 || Math.hypot(event.clientX - last.x, event.clientY - last.y) < 13)) return;
    last = { x: event.clientX, y: event.clientY, time: now };
    leaves.push({
      x: event.clientX + (Math.random() - .5) * 8,
      y: event.clientY + 7,
      vx: (Math.random() - .5) * 25, vy: 16 + Math.random() * 18,
      angle: Math.random() * Math.PI * 2, spin: (Math.random() - .5) * 2,
      size: 6 + Math.random() * 4, phase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)], age: 0, life: 1.2 + Math.random() * .6
    });
    if (leaves.length > 36) leaves.shift();
    if (frame === null) { previous = now; frame = requestAnimationFrame(tick); }
  }, { passive: true });
}
