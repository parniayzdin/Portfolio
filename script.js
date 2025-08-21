// ---- Theme ----
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');

// restore saved theme
if (savedTheme === 'light') {
  root.classList.add('light');
} else {
  root.classList.remove('light');
}

const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const isLight = root.classList.toggle('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

// ---- Remove background animations ----
const bgGradient = document.getElementById('bg-gradient');
if (bgGradient) bgGradient.style.animation = 'none';

const bgCanvas = document.getElementById('bg-canvas');
if (bgCanvas) bgCanvas.style.display = 'none';

const bgToggle = document.getElementById('bgToggle');
if (bgToggle) bgToggle.style.display = 'none';

// ---- Hero typewriter (id="typewriter") — run once ----
(function () {
  const tw = document.getElementById('typewriter');
  if (!tw) return;

  // You can override via: <h1 id="typewriter" data-text="Your text">

  // Respect reduced motion: just set the full text
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tw.textContent = text;
    return;
  }

  let i = 0;
  function tick() {
    if (i < text.length) {
      tw.textContent += text.charAt(i++);
      setTimeout(tick, 60);
    } else {
      tw.style.borderRight = 'none';
    }
  }
  tick();
})();

// ---- Footer year ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Type once for section titles ----
// Add class="type-once" to any <h1>/<h2> you want typed.
// To force a specific title NOT to type, either remove the class
// or add data-no-type to it.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Only target elements that have .type-once and NOT data-no-type
  const els = document.querySelectorAll('.type-once:not([data-no-type])');

  function typeTitle(el) {
    if (el.dataset.typed) return; // guard against re-entry
    el.dataset.typed = '1';

    const full = el.textContent.trim();
    const speed = Number(el.dataset.speed || 28);  // optional: data-speed="40"
    const delay = Number(el.dataset.delay || 0);   // optional: data-delay="200"

    el.textContent = '';
    el.classList.add('typing');

    let i = 0;
    function tick() {
      el.textContent = full.slice(0, ++i);
      if (i < full.length) {
        setTimeout(tick, speed);
      } else {
        el.classList.remove('typing'); // stop caret (if you style it)
      }
    }
    setTimeout(tick, delay);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        typeTitle(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  els.forEach((el) => io.observe(el));
})();
