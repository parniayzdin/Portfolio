import { launch, step } from './descent-physics.js';

const perch = document.querySelector('.cat-perch');
const actor = perch.querySelector('.perch-cat');
const buttons = [...perch.querySelectorAll('.perch-ledge')];
const context = actor.querySelector('canvas').getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const sheet = new Image();
const anchors = [[295, 444], [290, 444], [280, 382], [285, 371], [285, 435], [285, 424]];
let ledges = [], cat, target = 0, facing = 1, direction = 1;
let ready = false, raf = 0, lastTime = 0, crouch = 0, landing = 0, flightAge = 0;

function draw(pose) {
  context.setTransform(2, 0, 0, 2, 0, 0);
  context.clearRect(0, 0, 128, 128);
  context.save();
  context.translate(64, 108);
  context.scale(facing, 1);
  context.shadowColor = '#ccb887aa';
  context.shadowBlur = 1;
  const [ax, ay] = anchors[pose];
  context.drawImage(sheet, pose % 3 * 512, Math.floor(pose / 3) * 512, 512, 512,
    -ax * .205, -ay * .205, 512 * .205, 512 * .205);
  context.restore();
}
function render() {
  const busy = crouch > 0 || landing > 0 || cat.grounded === null;
  const pose = crouch > 0 ? 1 : cat.grounded === null ? (flightAge < .1 ? 2 : cat.vy < 100 ? 3 : 4) : landing > 0 ? 5 : 0;
  actor.style.transform = 'translate3d(' + cat.x + 'px,' + cat.y + 'px,0)';
  actor.dataset.pose = pose;
  perch.dataset.ledge = cat.grounded === null ? 'air' : String(cat.grounded);
  perch.dataset.phase = busy ? 'jumping' : 'idle';
  buttons.forEach((button, index) => { button.disabled = busy || cat.grounded === index; });
  draw(pose);
}
function settle(index = target) {
  cancelAnimationFrame(raf); raf = 0;
  crouch = landing = flightAge = 0;
  cat = { x: ledges[index].x, y: ledges[index].y, grounded: index, vx: 0, vy: 0, ignore: -1 };
  render();
}
function layout() {
  if (!ready) return;
  const width = perch.clientWidth;
  ledges = [.15, .5, .85].map((x, i) => ({ x: width * x, y: i === 1 ? 112 : 132, width: 62 }));
  buttons.forEach((button, i) => {
    button.style.left = (ledges[i].x - 31) + 'px';
    button.style.top = ledges[i].y + 'px';
  });
  settle(cat?.grounded ?? target);
}
function hop(index) {
  const destination = Math.max(0, Math.min(2, index));
  if (!ready || crouch || landing || cat.grounded === null || destination === cat.grounded) return;
  target = destination;
  facing = Math.sign(ledges[target].x - cat.x) || facing;
  if (reduced.matches) { settle(); return; }
  crouch = .13;
  lastTime = performance.now();
  render();
  raf = requestAnimationFrame(tick);
}
function next() {
  if (!cat || cat.grounded === null) return;
  if (cat.grounded === 2) direction = -1;
  if (cat.grounded === 0) direction = 1;
  hop(cat.grounded + direction);
}
function tick(time) {
  const dt = Math.min(.033, (time - lastTime) / 1000);
  lastTime = time; raf = 0;
  if (crouch > 0) {
    crouch = Math.max(0, crouch - dt);
    if (!crouch) { cat = launch(cat, ledges[target]); flightAge = 0; }
  } else if (cat.grounded === null) {
    flightAge += dt;
    cat = step(cat, dt, 0, ledges, perch.clientWidth);
    if (cat.grounded !== null) landing = .16;
  } else landing = Math.max(0, landing - dt);
  render();
  if (crouch || landing || cat.grounded === null) raf = requestAnimationFrame(tick);
}
actor.addEventListener('click', next);
buttons.forEach((button, index) => button.addEventListener('click', () => hop(index)));
perch.addEventListener('keydown', event => {
  if (!ready || event.altKey || event.ctrlKey || event.metaKey || !event.key.startsWith('Arrow')) return;
  event.preventDefault();
  if (cat.grounded === null) return;
  const delta = ['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 1;
  hop(cat.grounded + delta);
});
reduced.addEventListener('change', () => { if (ready && reduced.matches) settle(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && ready) settle(); });
new ResizeObserver(layout).observe(perch);
sheet.addEventListener('load', () => { ready = true; actor.disabled = false; layout(); });
sheet.src = 'assets/black-cat-jump-sheet.png';
