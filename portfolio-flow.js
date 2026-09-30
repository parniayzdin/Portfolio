const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector('.site-header');
const topLink = document.querySelector('.back-to-top');
const gallery = document.querySelector('.gallery-wrap');
const timeline = document.querySelector('.journey-timeline');
const rows = [...document.querySelectorAll('.journey-row')];
const sections = [...document.querySelectorAll('main > section[id]')];
const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
let frame = 0;

// Vendored locally so the page does not depend on a CDN or a build step.
if (window.Lenis) {
  new window.Lenis({
    autoRaf: true,
    lerp: .095,
    wheelMultiplier: .9,
    syncTouch: false,
    anchors: true,
    stopInertiaOnNavigate: true,
    respectReducedMotion: true
  });
}

function update() {
  frame = 0;
  const y = scrollY;
  const viewport = innerHeight;
  const total = document.documentElement.scrollHeight - viewport;
  header.classList.toggle('is-scrolled', y > 28);
  header.style.setProperty('--reading-progress', total > 0 ? Math.min(1, y / total) : 0);
  topLink.classList.toggle('is-visible', y > viewport * .65);
  gallery.style.setProperty('--gallery-drift', reduced.matches ? '0px' : Math.min(26, y * .045) + 'px');
  const bounds = timeline.getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, (viewport * .55 - bounds.top) / bounds.height));
  timeline.style.setProperty('--timeline-progress', progress);
  for (const row of rows) row.classList.toggle('is-active', row.getBoundingClientRect().top < viewport * .62);
  let current = sections[0].id;
  for (const section of sections) if (section.getBoundingClientRect().top <= viewport * .35) current = section.id;
  for (const link of navLinks) {
    if (link.hash === '#' + current) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}
function schedule() { if (!frame) frame = requestAnimationFrame(update); }

const reveals = [...document.querySelectorAll('[data-reveal], .work-entry')];
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    entry.target.classList.remove('reveal-pending');
    observer.unobserve(entry.target);
  }
}, { rootMargin: '0px 0px -40px 0px', threshold: .06 });
for (const element of reveals) {
  element.dataset.reveal = '';
  if (!reduced.matches && element.getBoundingClientRect().top > innerHeight - 40) {
    element.classList.add('reveal-pending');
    observer.observe(element);
  }
}
reduced.addEventListener('change', () => {
  if (reduced.matches) for (const element of reveals) element.classList.remove('reveal-pending');
  schedule();
});
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule);
document.fonts.ready.then(schedule);
update();
