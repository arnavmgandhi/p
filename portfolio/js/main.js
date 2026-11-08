/**
 * MAIN
 * Header, menu, theme, projects, marquee, parallax, cursor, magnetic buttons, service worker.
 */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initThemeToggle();
  initActiveSection();
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  renderProjects();
  initServiceWorker();
  initProgress();
  initMarquee();
  initParallax();
  initCursor();
  initMagnetic();

  if (window.animationController) window.animationController.init();
});

/* ---------- Header ---------- */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.mobile-nav');
  if (!toggle || !nav) return;

  const set = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); toggle.focus(); }
  });
  window.addEventListener('resize', () => { if (window.innerWidth >= 820) set(false); });
}

/* ---------- Theme ---------- */
function initThemeToggle() {
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  const label = btn.querySelector('.theme-toggle-text');
  const root = document.documentElement;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  const current = () => root.getAttribute('data-theme') || (mq.matches ? 'dark' : 'light');
  const paint = () => { if (label) label.textContent = current() === 'dark' ? 'Light' : 'Dark'; };

  btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
    paint();
  });
  mq.addEventListener('change', paint);
  paint();
}

/* ---------- Active nav link ---------- */
function initActiveSection() {
  const sections = document.querySelectorAll('main section[id]');
  const links = document.querySelectorAll('.nav-link, .mobile-nav-link');
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach((s) => io.observe(s));
}

/* ---------- Projects: each card is one big link ---------- */
function renderProjects() {
  const list = document.getElementById('projects-list');
  if (!list) return;
  const projects = window.portfolioProjects || [];
  if (!projects.length) { list.innerHTML = '<p class="label">Projects coming soon.</p>'; return; }

  list.innerHTML = projects.map((p) => {
    const t = p.tile || {};
    const art = p.image
      ? `<div class="tile-par" data-par="0.08"><img src="${esc(p.image)}" alt="" loading="lazy" width="1280" height="720"></div>`
      : `<div class="tile-par" data-par="0.12" aria-hidden="true"><span class="tile-glyph">${esc(t.text || p.title.charAt(0))}</span></div>`;
    const style = `--tile:${esc(t.bg || 'var(--bg-sunk)')};--tile-ink:${esc(t.fg || 'var(--ink)')}`;
    const inner = `
      <div class="project-media" style="${style}">${art}</div>
      <div class="project-info">
        <h3 class="project-title">${esc(p.title)}</h3>
        <span class="project-arrow" aria-hidden="true"><span>&nearr;</span></span>
      </div>
      <p class="project-desc">${esc(p.description)}</p>
      <div class="project-line" aria-hidden="true"></div>`;

    return p.liveUrl
      ? `<a class="project" data-reveal href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(p.title)} (opens in a new tab)">${inner}</a>`
      : `<div class="project" data-reveal>${inner}</div>`;
  }).join('');

  if (window.animationController && window.animationController.refresh) window.animationController.refresh();
}

/* ---------- Scroll progress ---------- */
function initProgress() {
  const bar = document.querySelector('.progress');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---------- Marquee: speed and direction follow your scroll ---------- */
function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track || REDUCED) return;
  let x = 0, dir = -1, vel = 0, last = window.scrollY, hover = false, visible = true;

  track.parentElement.addEventListener('mouseenter', () => { hover = true; });
  track.parentElement.addEventListener('mouseleave', () => { hover = false; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(track.parentElement);
  }

  const loop = () => {
    const y = window.scrollY, d = y - last; last = y;
    vel += (d - vel) * 0.08;
    if (vel > 1.5) dir = -1; else if (vel < -1.5) dir = 1;
    if (visible) {
      const speed = (hover ? 0.15 : 0.7) + Math.min(Math.abs(vel), 50) * 0.22;
      const half = track.scrollWidth / 2;
      x += dir * speed;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px,0,0)`;
    }
    requestAnimationFrame(loop);
  };
  loop();
}

/* ---------- Parallax on project tiles ---------- */
function initParallax() {
  if (REDUCED) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    document.querySelectorAll('.tile-par').forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const progress = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 around centre
      el.style.transform = `translate3d(0, ${(-progress * 100 * parseFloat(el.dataset.par || 0.1)).toFixed(1)}px, 0)`;
    });
  };
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  window.addEventListener('load', queue);
  setTimeout(queue, 300);
}

/* ---------- Cursor (fine pointers only) ---------- */
function initCursor() {
  const el = document.querySelector('.cursor');
  if (!el || !FINE_POINTER || REDUCED) return;
  document.documentElement.classList.add('has-cursor');

  let x = -100, y = -100, cx = x, cy = y;
  window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; el.classList.add('is-on'); }, { passive: true });
  document.addEventListener('mouseleave', () => el.classList.remove('is-on'));
  const loop = () => {
    cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
    el.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.addEventListener('mouseover', (e) => {
    el.classList.toggle('is-hot', !!e.target.closest('a, button'));
  });
}

/* ---------- Magnetic buttons ---------- */
function initMagnetic() {
  if (!FINE_POINTER || REDUCED) return;
  document.querySelectorAll('.btn').forEach((b) => {
    b.addEventListener('mousemove', (e) => {
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      b.style.transform = `translate(${dx * 12}px, ${dy * 10}px)`;
    });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });
}

/* ---------- Service worker ---------- */
function initServiceWorker() {
  const ok = location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname);
  if (!('serviceWorker' in navigator) || !ok) return;
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

function esc(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
