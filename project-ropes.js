// The attendant on the navigation side pulls the horizontal project reel.
export function startProjectRopes(reducedMotion) {
  const stage = document.querySelector('.project-puppet-stage');
  if (!stage) return;
  const reel = stage.querySelector('.project-reel');
  const cards = [...reel.querySelectorAll('.project')];
  const figures = [...stage.querySelectorAll('.rope-puller')];
  const previous = stage.querySelector('.reel-previous');
  const next = stage.querySelector('.reel-next');
  const status = stage.querySelector('.reel-position');
  const svg = stage.querySelector('.project-ropes');
  const strands = svg.querySelector('.rope-strands');
  const knots = svg.querySelector('.rope-knots');
  const ns = 'http://www.w3.org/2000/svg';
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  const make = (tag, attrs = {}) => {
    const element = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };
  const clip = make('clipPath', { id: 'project-rope-window', clipPathUnits: 'userSpaceOnUse' });
  const clipRect = make('rect');
  clip.append(clipRect);
  const defs = make('defs');
  defs.append(clip);
  svg.prepend(defs);
  knots.setAttribute('clip-path', 'url(#project-rope-window)');
  const paths = [];
  const rings = [];
  for (let i = 0; i < 1; i++) {
    const base = make('path', { class: 'rope-base' });
    const fibre = make('path', { class: 'rope-fibre' });
    strands.append(base, fibre);
    paths.push([base, fibre]);
  }
  for (let i = 0; i < cards.length * 2; i++) {
    const ring = make('circle', { r: '3.5' });
    knots.append(ring);
    rings.push(ring);
  }
  let frame = null, lastFrame = 0, lastScroll = reel.scrollLeft;
  let direction = 0, activeUntil = 0;
  let pull = [0, 0];
  let drag = null, suppressClick = false;
  const maxScroll = () => Math.max(0, reel.scrollWidth - reel.clientWidth);
  function cardStops() {
    const left = reel.getBoundingClientRect().left;
    return cards.map(card => clamp(card.getBoundingClientRect().left - left + reel.scrollLeft, 0, maxScroll()));
  }
  function goTo(left) {
    reel.scrollTo({ left: clamp(left, 0, maxScroll()), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  function step(sign) {
    const stops = cardStops();
    const target = sign > 0
      ? stops.find(left => left > reel.scrollLeft + 3) ?? maxScroll()
      : stops.findLast(left => left < reel.scrollLeft - 3) ?? 0;
    goTo(target);
  }
  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  reel.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') goTo(0);
    else if (event.key === 'End') goTo(maxScroll());
    else step(event.key === 'ArrowLeft' ? -1 : 1);
  });
  // Touch and horizontal trackpad scrolling stay native; desktop also supports dragging.
  reel.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    suppressClick = false;
    drag = { id: event.pointerId, x: event.clientX, scroll: reel.scrollLeft, moved: false };
  });
  reel.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    if (!(event.buttons & 1)) { drag = null; return; }
    const distance = event.clientX - drag.x;
    if (!drag.moved && Math.abs(distance) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      reel.classList.add('is-dragging');
      reel.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    reel.scrollLeft = drag.scroll - distance;
  });
  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved;
    drag = null;
    suppressClick = moved;
    reel.classList.remove('is-dragging');
    if (reel.hasPointerCapture(event.pointerId)) reel.releasePointerCapture(event.pointerId);
    if (moved) goTo(cardStops().reduce((nearest, left) => Math.abs(left - reel.scrollLeft) < Math.abs(nearest - reel.scrollLeft) ? left : nearest));
  }
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) reel.addEventListener(name, endDrag);
  reel.addEventListener('dragstart', event => event.preventDefault());
  reel.addEventListener('click', event => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick = false;
  }, true);
  reel.addEventListener('scroll', () => {
    const change = reel.scrollLeft - lastScroll;
    if (Math.abs(change) > .1) {
      direction = Math.sign(change);
      activeUntil = performance.now() + 130;
    }
    lastScroll = reel.scrollLeft;
    schedule();
  }, { passive: true });
  function render(now) {
    frame = null;
    const dt = Math.min((now - lastFrame) / 1000 || .016, .05);
    lastFrame = now;
    const active = !reducedMotion.matches && now < activeUntil;
    pull = pull.map((amount, i) => {
      const target = active && direction === (i === 0 ? -1 : 1) ? 1 : 0;
      return reducedMotion.matches ? 0 : amount + (target - amount) * (1 - Math.exp(-dt * 15));
    });
    const bounds = stage.getBoundingClientRect();
    const compact = stage.clientWidth < 600;
    const reelBounds = reel.getBoundingClientRect();
    const firstCard = cards[0].getBoundingClientRect();
    const ropeCenter = firstCard.top - bounds.top + firstCard.height * .5;
    figures.forEach((figure, i) => {
      const sign = i === 0 ? -1 : 1;
      figure.style.top = `${ropeCenter - figure.offsetHeight * .408}px`;
      figure.style.transform = `translate(${sign * pull[i] * (compact ? 5 : 16)}px, ${pull[i] * 3}px) rotate(${sign * pull[i] * 7}deg)`;
    });
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    clipRect.setAttribute('x', reelBounds.left - bounds.left - 5);
    clipRect.setAttribute('width', reelBounds.width + 10);
    clipRect.setAttribute('height', bounds.height);
    const grips = figures.map(figure => {
      const grip = figure.querySelector('.rope-grip').getBoundingClientRect();
      return { x: grip.left - bounds.left, y: grip.top - bounds.top };
    });
    const [left, right] = grips;
    const tension = Math.max(...pull);
    const control = { x: (left.x + right.x) / 2, y: Math.max(left.y, right.y) + (compact ? 7 : 14) * (1 - tension * .8) };
    const railY = x => {
      const t = clamp((x - left.x) / (right.x - left.x));
      return (1 - t) ** 2 * left.y + 2 * (1 - t) * t * control.y + t ** 2 * right.y;
    };
    const setPath = (index, d) => paths[index].forEach(path => {
      path.setAttribute('d', d);
      path.style.strokeDashoffset = `${reel.scrollLeft * .35}`;
    });
    setPath(0, `M ${left.x} ${left.y} Q ${control.x} ${control.y} ${right.x} ${right.y}`);
    const visible = [];
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const visibleWidth = Math.min(rect.right, reelBounds.right) - Math.max(rect.left, reelBounds.left);
      if (visibleWidth >= rect.width * .5) visible.push(i + 1);
      [rect.left, rect.right].forEach((edge, side) => {
        const x = edge - bounds.left;
        const index = i * 2 + side;
        rings[index].setAttribute('cx', x);
        rings[index].setAttribute('cy', railY(x));
      });
    });
    previous.disabled = reel.scrollLeft <= 2;
    next.disabled = reel.scrollLeft >= maxScroll() - 2;
    if (visible.length) {
      const range = visible.length === 1 ? `${visible[0]}` : `${visible[0]}–${visible.at(-1)}`;
      const label = `${range} / ${cards.length}`;
      if (status.textContent !== label) status.textContent = label;
    }
    if (active || pull.some(amount => amount > .002)) schedule();
  }
  function schedule() {
    if (frame === null) frame = requestAnimationFrame(render);
  }
  window.addEventListener('resize', schedule, { passive: true });
  reducedMotion.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(reel);
  document.fonts.ready.then(schedule);
  schedule();
}
