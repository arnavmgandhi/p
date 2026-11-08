/**
 * MOTION
 * Dependency-free. Headline words rise out of a mask; [data-reveal] blocks fade up once;
 * project tiles wipe in. Everything is skipped under prefers-reduced-motion.
 */

class AnimationController {
  init() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.splitHeadlines();

    if (reduced || !('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal], .split').forEach((el) => el.classList.add('is-in'));
      return;
    }

    this.io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        this.io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    // Hero headline plays on load, other headlines when scrolled to
    requestAnimationFrame(() => {
      document.querySelectorAll('#hero .split').forEach((el) => el.classList.add('is-in'));
    });
    document.querySelectorAll('.split:not(#hero .split)').forEach((el) => this.io.observe(el));

    document.querySelectorAll('.skill-list').forEach((list) => {
      list.querySelectorAll('[data-reveal]').forEach((el, i) => el.style.setProperty('--d', `${Math.min(i, 5) * 60}ms`));
    });
    document.querySelectorAll('[data-reveal]').forEach((el) => this.io.observe(el));
  }

  /** Call after injecting new [data-reveal] nodes (projects) */
  refresh() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('#projects-list [data-reveal]:not(.is-in)').forEach((el) => {
      if (reduced || !this.io) { el.classList.add('is-in'); return; }
      this.io.observe(el);
    });
  }

  /** Wrap each word in a mask span so it can slide up. Keeps inline elements. */
  splitHeadlines() {
    const wrap = (node, counter) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.style.setProperty('--i', counter.n++);
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          wrap(child, counter);
        }
      });
    };
    document.querySelectorAll('.split').forEach((el) => {
      el.setAttribute('aria-label', el.textContent.trim());
      wrap(el, { n: 0 });
    });
  }
}

window.animationController = new AnimationController();
