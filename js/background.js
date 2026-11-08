/**
 * BACKGROUND + INTERACTIVITY
 *
 * 1. Pixel-dust canvas background — tiny warm squares that drift slowly,
 *    matching the paper palette. Mouse gently repels them.
 * 2. Pixel cursor trail — crisp square sparks follow the pointer.
 * 3. Buddy reactions — coder/wizard/reader react when you hover their section.
 * 4. Konami code easter egg — 8-bit party mode.
 *
 * Respects prefers-reduced-motion throughout.
 */

const BG = (() => {
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DARK    = () => document.documentElement.getAttribute('data-theme') === 'dark'
                      || (!document.documentElement.getAttribute('data-theme')
                          && window.matchMedia('(prefers-color-scheme: dark)').matches);

  /* ─────────────────────────────────────────────
     1. PIXEL DUST CANVAS BACKGROUND
  ───────────────────────────────────────────── */
  function initPixelDust() {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = `
      position:fixed; inset:0; width:100%; height:100%;
      pointer-events:none; z-index:0;
    `;
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let W, H, dpr, particles = [];
    let mx = null, my = null;

    /* Palette — warm dust flecks */
    const LIGHT_COLORS = ['#c9a87c', '#b8935f', '#8b6f4e', '#d4b48a', '#e8c99a'];
    const DARK_COLORS  = ['#4a3828', '#6b4f35', '#3d2d1e', '#5c4030', '#2e2018'];

    function colors() { return DARK() ? DARK_COLORS : LIGHT_COLORS; }

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width  = W * dpr; canvas.height = H * dpr;
      canvas.style.width  = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawn();
    }

    function spawn() {
      const count = W < 768 ? 28 : 55;
      particles = Array.from({ length: count }, () => makeParticle());
    }

    function makeParticle(forceX, forceY) {
      const pal = colors();
      return {
        x:     forceX ?? Math.random() * W,
        y:     forceY ?? Math.random() * H,
        vx:    (Math.random() - 0.5) * 0.3,
        vy:    (Math.random() - 0.5) * 0.3,
        size:  Math.random() < 0.6 ? 2 : 4,   // crisp pixel squares
        alpha: Math.random() * 0.25 + 0.07,
        color: pal[Math.floor(Math.random() * pal.length)],
      };
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        /* gentle mouse repulsion */
        if (mx !== null) {
          const dx = p.x - mx, dy = p.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < 14400 && d2 > 0) { // 120px
            const d = Math.sqrt(d2), f = (120 - d) / 120 * 1.2;
            p.x += dx / d * f; p.y += dy / d * f;
          }
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    window.addEventListener('mouseleave', () => { mx = my = null; }, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { mx = my = null; } });

    resize();
    if (!REDUCED) draw();
  }

  /* ─────────────────────────────────────────────
     2. PIXEL CURSOR TRAIL
  ───────────────────────────────────────────── */
  function initCursorTrail() {
    if (REDUCED) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const TRAIL_LENGTH = 10;
    const SIZES = [4, 3, 3, 2, 2, 2, 2, 1, 1, 1];
    const SPARK_COLORS = ['#e4694a', '#c9a87c', '#b8935f', '#ffe066', '#d4b48a'];

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = `
      position:fixed; inset:0; width:100%; height:100%;
      pointer-events:none; z-index:200;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W, H, dpr;
    let trail = [];   // { x, y, alpha, size, color }[]
    let mx = 0, my = 0;

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width  = W * dpr; canvas.height = H * dpr;
      canvas.style.width  = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
      trail.unshift({ x: mx, y: my, alpha: 1, size: SIZES[0], color });
      if (trail.length > TRAIL_LENGTH) trail.length = TRAIL_LENGTH;
    }, { passive: true });

    function drawTrail() {
      ctx.clearRect(0, 0, W, H);
      trail.forEach((s, i) => {
        s.alpha = Math.max(0, 1 - i / TRAIL_LENGTH);
        ctx.globalAlpha = s.alpha * 0.75;
        ctx.fillStyle   = s.color;
        const sz = SIZES[Math.min(i, SIZES.length - 1)];
        ctx.fillRect(Math.round(s.x - sz / 2), Math.round(s.y - sz / 2), sz, sz);
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(drawTrail);
    }

    resize();
    drawTrail();
  }

  /* ─────────────────────────────────────────────
     3. BUDDY REACTIONS
     Coder reacts when you hover a project card.
     Shows a "!" bubble above his head.
  ───────────────────────────────────────────── */
  function initBuddyReactions() {
    /* Coder reacts to project card hover */
    const projectsSection = document.getElementById('projects');
    const coderBuddy      = projectsSection?.querySelector('.coder-buddy');
    if (coderBuddy) {
      const bubble = document.createElement('div');
      bubble.className = 'buddy-bubble';
      bubble.textContent = '!';
      bubble.setAttribute('aria-hidden', 'true');
      coderBuddy.parentElement.style.position = 'relative';
      coderBuddy.parentElement.appendChild(bubble);

      let timeout;
      const react = () => {
        clearTimeout(timeout);
        coderBuddy.classList.add('buddy-excited');
        bubble.classList.add('buddy-bubble--show');
        timeout = setTimeout(() => {
          coderBuddy.classList.remove('buddy-excited');
          bubble.classList.remove('buddy-bubble--show');
        }, 1800);
      };

      /* Observe projects area — react when any project card is hovered */
      document.addEventListener('mouseover', e => {
        if (e.target.closest('.project')) react();
      });
    }

    /* Wizard reacts when hovering the skills list */
    const practiceSection = document.getElementById('practice');
    const wizardBuddy     = practiceSection?.querySelector('.skills-buddy');
    if (wizardBuddy) {
      const bubble = document.createElement('div');
      bubble.className = 'buddy-bubble buddy-bubble--star';
      bubble.textContent = '★';
      bubble.setAttribute('aria-hidden', 'true');
      wizardBuddy.parentElement.style.position = 'relative';
      wizardBuddy.parentElement.appendChild(bubble);

      let timeout;
      document.addEventListener('mouseover', e => {
        if (e.target.closest('.skill-row')) {
          clearTimeout(timeout);
          wizardBuddy.classList.add('buddy-excited');
          bubble.classList.add('buddy-bubble--show');
          timeout = setTimeout(() => {
            wizardBuddy.classList.remove('buddy-excited');
            bubble.classList.remove('buddy-bubble--show');
          }, 1600);
        }
      });
    }

    /* Reader reacts when hovering the about facts */
    const aboutSection = document.getElementById('about');
    const readerBuddy  = aboutSection?.querySelector('.about-buddy');
    if (readerBuddy) {
      const bubble = document.createElement('div');
      bubble.className = 'buddy-bubble buddy-bubble--thought';
      bubble.textContent = '...';
      bubble.setAttribute('aria-hidden', 'true');
      readerBuddy.parentElement.style.position = 'relative';
      readerBuddy.parentElement.appendChild(bubble);

      let timeout;
      document.addEventListener('mouseover', e => {
        if (e.target.closest('.fact') || e.target.closest('.about-lead')) {
          clearTimeout(timeout);
          readerBuddy.classList.add('buddy-excited');
          bubble.classList.add('buddy-bubble--show');
          timeout = setTimeout(() => {
            readerBuddy.classList.remove('buddy-excited');
            bubble.classList.remove('buddy-bubble--show');
          }, 1600);
        }
      });
    }
  }

  /* ─────────────────────────────────────────────
     4. KONAMI CODE EASTER EGG
     ↑↑↓↓←→←→BA → pixel party for 4 seconds
  ───────────────────────────────────────────── */
  function initKonamiCode() {
    const SEQ = ['w','a','s','d','1','2','3'];
    let idx = 0;

    document.addEventListener('keydown', e => {
      if (e.key === SEQ[idx]) { idx++; } else { idx = e.key === SEQ[0] ? 1 : 0; }
      if (idx === SEQ.length) {
        idx = 0;
        partyTime();
      }
    });

    function partyTime() {
      if (document.querySelector('.konami-overlay')) return;

      const overlay = document.createElement('div');
      overlay.className = 'konami-overlay';
      overlay.setAttribute('aria-live', 'assertive');
      overlay.setAttribute('aria-label', 'Easter egg activated: pixel party!');

      const msg = document.createElement('div');
      msg.className = 'konami-msg';
      msg.innerHTML = `<span>🎮</span> KONAMI! <span>🎮</span><br>
        <small>you found the secret</small>`;
      overlay.appendChild(msg);
      document.body.appendChild(overlay);

      /* burst of pixel confetti */
      const burstCanvas = document.createElement('canvas');
      burstCanvas.setAttribute('aria-hidden', 'true');
      burstCanvas.style.cssText = `position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;`;
      document.body.appendChild(burstCanvas);
      const bctx = burstCanvas.getContext('2d');
      const bW = window.innerWidth, bH = window.innerHeight;
      burstCanvas.width = bW; burstCanvas.height = bH;

      const PARTY_COLORS = ['#e4694a','#c9a87c','#ffe066','#7b50d0','#4ea87b','#e8c99a'];
      const bits = Array.from({ length: 80 }, () => ({
        x: bW / 2 + (Math.random() - 0.5) * 200,
        y: bH / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -14 - 4,
        size: Math.random() < 0.5 ? 6 : 10,
        color: PARTY_COLORS[Math.floor(Math.random() * PARTY_COLORS.length)],
        rot: Math.random() * Math.PI * 2,
        rspeed: (Math.random() - 0.5) * 0.3,
        gravity: 0.4 + Math.random() * 0.3,
        alpha: 1,
      }));

      const start = performance.now();
      const DURATION = 4000;

      function burstFrame(now) {
        const elapsed = now - start;
        const t = elapsed / DURATION;
        bctx.clearRect(0, 0, bW, bH);

        for (const b of bits) {
          b.vy += b.gravity;
          b.x += b.vx; b.y += b.vy; b.rot += b.rspeed;
          b.alpha = Math.max(0, 1 - t * 1.2);
          bctx.globalAlpha = b.alpha;
          bctx.fillStyle = b.color;
          bctx.save();
          bctx.translate(b.x, b.y);
          bctx.rotate(b.rot);
          bctx.fillRect(-b.size / 2, -b.size / 2, b.size, b.size);
          bctx.restore();
        }
        bctx.globalAlpha = 1;

        if (elapsed < DURATION) {
          requestAnimationFrame(burstFrame);
        } else {
          burstCanvas.remove();
          overlay.classList.add('konami-overlay--out');
          setTimeout(() => overlay.remove(), 500);
        }
      }
      requestAnimationFrame(burstFrame);

      /* make all buddies go wild */
      document.querySelectorAll('.pixel-buddy').forEach(b => {
        b.classList.add('buddy-party');
        setTimeout(() => b.classList.remove('buddy-party'), DURATION);
      });
    }
  }

  /* ─── boot ─── */
  return {
    init() {
      initPixelDust();
      initCursorTrail();
      initBuddyReactions();
      initKonamiCode();
    }
  };
})();

document.addEventListener('DOMContentLoaded', () => BG.init());
