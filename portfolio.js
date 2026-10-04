// Shared interaction helpers for the portfolio. Idempotent + document-scoped.
// Includes in-page (SPA-style) navigation so the custom cursor never blinks
// back to the native arrow between pages.

export function initAll(opts = {}) {
  initCursor();
  initReveal();
  initMagnetic();
  initPinScroll();
  initBottomReveal();
  initSmoothNav();
  if (opts.loader !== false) initLoader();
}

/* ---------- Pinned horizontal screenshot scroll ---------- */
// The wrapper pins to the viewport; vertical page scroll drives the strip
// horizontally. No scrollbar, no drag. Cancels its previous loop on re-init
// so repeated visits (via in-page nav) don't stack rAF loops.
let _pinCleanup = null;
export function initPinScroll() {
  if (_pinCleanup) { _pinCleanup(); _pinCleanup = null; }
  const wrap = document.querySelector('[data-pin-wrap]');
  const track = wrap && wrap.querySelector('[data-htrack]');
  if (!wrap || !track) return;

  let overflow = 0, raf = 0, last = -1;
  const layout = () => {
    overflow = Math.max(0, track.scrollWidth - window.innerWidth);
    wrap.style.height = (window.innerHeight + overflow) + 'px';
  };
  layout();
  window.addEventListener('resize', layout);

  (function tick() {
    const total = wrap.offsetHeight - window.innerHeight;
    const top = wrap.getBoundingClientRect().top;
    const progress = Math.min(1, Math.max(0, (-top) / (total || 1)));
    if (progress !== last) {
      last = progress;
      track.style.transform = `translate3d(${-progress * overflow}px,0,0)`;
    }
    raf = requestAnimationFrame(tick);
  })();

  _pinCleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', layout);
  };
}

/* ---------- Reveal-at-bottom-of-page ---------- */
let _bottomIO = null;
export function initBottomReveal() {
  if (_bottomIO) { _bottomIO.disconnect(); _bottomIO = null; }
  const els = document.querySelectorAll('[data-bottom-reveal]');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const on = en.intersectionRatio > 0.55;
      en.target.style.opacity = on ? '1' : '0';
      en.target.style.transform = on ? 'translateY(0)' : 'translateY(14px)';
    });
  }, { threshold: [0, 0.55, 1] });
  els.forEach((el) => io.observe(el));
  _bottomIO = io;
}

/* ---------- Custom cursor (reticle) ---------- */
// A 26x26 frame of 4 L-shaped corner brackets + a center crosshair dot.
// Follows the pointer; on hovering an interactive element it snaps + expands
// to wrap that element's box and hides the center dot. Initialized once and
// kept alive across in-page navigations.
export function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch
  if (document.getElementById('ak-cursor-reticle')) return;

  const ACCENT = '#2fe6a8';

  const reticle = document.createElement('div');
  reticle.id = 'ak-cursor-reticle';
  Object.assign(reticle.style, {
    position: 'fixed', top: '0', left: '0', pointerEvents: 'none', zIndex: '99999',
    width: '26px', height: '26px', transform: 'translate(-50%,-50%)',
    opacity: '0', willChange: 'transform,width,height', mixBlendMode: 'normal',
    transition: 'opacity .25s ease',
  });

  const L = 9; // corner arm length
  const corners = [];
  const cfg = [
    { t: '0', l: '0', bt: 1, bl: 1 },           // top-left
    { t: '0', r: '0', bt: 1, br: 1 },           // top-right
    { b: '0', l: '0', bb: 1, bl: 1 },           // bottom-left
    { b: '0', r: '0', bb: 1, br: 1 },           // bottom-right
  ];
  cfg.forEach((c) => {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'absolute', width: L + 'px', height: L + 'px',
      borderStyle: 'solid', borderColor: ACCENT, borderWidth: '0',
      transition: 'border-color .2s ease',
    });
    if (c.t !== undefined) el.style.top = c.t; if (c.b !== undefined) el.style.bottom = c.b;
    if (c.l !== undefined) el.style.left = c.l; if (c.r !== undefined) el.style.right = c.r;
    if (c.bt) el.style.borderTopWidth = '1.5px'; if (c.bb) el.style.borderBottomWidth = '1.5px';
    if (c.bl) el.style.borderLeftWidth = '1.5px'; if (c.br) el.style.borderRightWidth = '1.5px';
    reticle.appendChild(el); corners.push(el);
  });

  // center crosshair dot
  const dot = document.createElement('div');
  Object.assign(dot.style, {
    position: 'absolute', top: '50%', left: '50%', width: '3px', height: '3px',
    background: ACCENT, borderRadius: '50%', transform: 'translate(-50%,-50%)',
    transition: 'opacity .15s ease',
  });
  reticle.appendChild(dot);
  document.body.appendChild(reticle);

  const hide = document.createElement('style');
  hide.id = 'ak-cursor-hide';
  hide.textContent = '*, *::before, *::after, a, button, [data-cursor] { cursor: none !important; }';
  document.head.appendChild(hide);

  let mx = innerWidth / 2, my = innerHeight / 2, seen = false;
  // smoothed size + position for the snap-to-target effect
  let cx = mx, cy = my, cw = 26, ch = 26;
  let tx = mx, ty = my, tw = 26, th = 26; // targets
  let locked = false;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!seen) { seen = true; cx = mx; cy = my; reticle.style.opacity = '1'; }
  });

  let hoverEl = null; // element currently carrying the JS-driven highlight
  function setHover(el) {
    if (hoverEl === el) return;
    if (hoverEl) hoverEl.classList.remove('ak-on');
    hoverEl = el;
    if (hoverEl) hoverEl.classList.add('ak-on');
  }

  // expand + lock onto a given element
  function lockTo(el) {
    const r = el.getBoundingClientRect();
    const pad = 8;
    tw = Math.min(r.width + pad * 2, innerWidth);
    th = Math.min(r.height + pad * 2, innerHeight);
    tx = r.left + r.width / 2; ty = r.top + r.height / 2;
    locked = true; dot.style.opacity = '0';
    setHover(el);              // <-- added
  }
  function release() {
    locked = false; tw = 26; th = 26; dot.style.opacity = '1';
    setHover(null);           // <-- added
  }

  function pickTarget(e) {
    const el = e.target.closest('[data-cursor], a, button');
    if (el) lockTo(el);
  }
  document.addEventListener('mouseover', pickTarget);
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-cursor], a, button')) release();
  });

  document.addEventListener('mousedown', () => { reticle.dataset.down = '1'; });
  document.addEventListener('mouseup', () => { delete reticle.dataset.down; });

  // After an in-page navigation the element under the pointer changed without a
  // mouseover/mouseout firing — re-evaluate against the new DOM so the reticle
  // doesn't stay stuck locked onto (or released from) the link that was clicked.
  // window.__akCursorSync = () => {
  //   const el = document.elementFromPoint(mx, my);
  //   const hit = el && el.closest('[data-cursor], a, button');
  //   if (hit) lockTo(hit); else release();
  // };
  function syncAtPointer() {
    if (!seen) return;
    const el = document.elementFromPoint(mx, my);
    const hit = el && el.closest('[data-cursor], a, button');
    if (hit) lockTo(hit); else release();
  }
  window.__akCursorSync = syncAtPointer;
  window.addEventListener('scroll', syncAtPointer, { passive: true });

  (function loop() {
    // when locked, follow the element center; otherwise follow the pointer
    if (!locked) { tx = mx; ty = my; }
    const ease = locked ? 0.22 : 0.32;
    cx += (tx - cx) * ease; cy += (ty - cy) * ease;
    cw += (tw - cw) * 0.25; ch += (th - ch) * 0.25;
    const press = reticle.dataset.down ? 0.88 : 1;
    reticle.style.width = cw + 'px';
    reticle.style.height = ch + 'px';
    reticle.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%) scale(${press})`;
    requestAnimationFrame(loop);
  })();
}

/* ---------- Loader ---------- */
export function initLoader() {
  const el = document.getElementById('ak-loader');
  if (!el) return;
  const bar = el.querySelector('[data-loader-bar]');
  const pct = el.querySelector('[data-loader-pct]');
  let p = 0;
  const tick = () => {
    p += Math.max(1, (100 - p) * 0.12);
    if (p > 100) p = 100;
    if (bar) bar.style.width = p + '%';
    if (pct) pct.textContent = String(Math.floor(p)).padStart(3, '0');
    if (p < 100) { setTimeout(tick, 60); }
    else {
      setTimeout(() => {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        setTimeout(() => { el.style.display = 'none'; }, 600);
      }, 250);
    }
  };
  setTimeout(tick, 200);
}

/* ---------- Scroll reveal ---------- */
let _revealIO = null;
export function initReveal() {
  if (_revealIO) { _revealIO.disconnect(); _revealIO = null; }
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        const d = en.target.getAttribute('data-reveal-delay') || 0;
        en.target.style.transitionDelay = d + 'ms';
        en.target.style.opacity = '1';
        en.target.style.transform = 'none';
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
  _revealIO = io;
}

/* ---------- Magnetic text ---------- */
// Removes its previous listeners on re-init so repeated visits to the page that
// has the magnetic name don't stack mousemove/resize/scroll handlers.
let _magnetCleanup = null;
export function initMagnetic() {
  if (_magnetCleanup) { _magnetCleanup(); _magnetCleanup = null; }
  const chars = document.querySelectorAll('[data-magnet]');
  if (!chars.length) return;
  const R = 120; // influence radius
  const positions = () => Array.from(chars).map((c) => {
    const r = c.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  });
  let pos = positions();
  const onResize = () => { pos = positions(); };
  const onScroll = () => { pos = positions(); };
  const onMove = (e) => {
    chars.forEach((c, i) => {
      const p = pos[i]; if (!p) return;
      const dx = p.cx - e.clientX, dy = p.cy - e.clientY;
      const dist = Math.hypot(dx, dy);
      if (dist < R) {
        const f = (1 - dist / R);
        const tx = (dx / (dist || 1)) * f * 26;
        const ty = (dy / (dist || 1)) * f * 26;
        c.style.transform = `translate(${tx}px,${ty}px)`;
        c.style.color = `rgba(47,230,168,${0.4 + f * 0.6})`;
      } else {
        c.style.transform = 'translate(0,0)';
        c.style.color = '';
      }
    });
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('mousemove', onMove);
  _magnetCleanup = () => {
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('mousemove', onMove);
  };
}

/* ---------- In-page navigation (keeps the custom cursor alive) ---------- */
// Intercepts clicks on internal .html links and swaps page content inside the
// same document instead of doing a full browser navigation. Because the
// document is never torn down, the browser never loses the pointer position,
// so the native arrow never flashes back between pages.
let _smoothBound = false;
export function initSmoothNav() {
  if (_smoothBound) return; // attach the document-level listeners only once
  _smoothBound = true;

  const interceptable = (a) => {
    if (!a || a.tagName !== 'A') return false;
    const raw = a.getAttribute('href') || '';
    if (raw.startsWith('#')) return false;                 // in-page anchor — leave it
    return a.origin === location.origin &&
           a.pathname.endsWith('.html') &&
           !a.target && !a.hasAttribute('download');
  };

  // re-wrap the magnetic name letters (the inline boot script in each HTML file
  // does NOT run after we set innerHTML, so do its work here)
  const wrapMagnetWords = () => {
    document.querySelectorAll('[data-magnet-word]').forEach((el) => {
      if (el.dataset.wrapped) return;
      const text = el.textContent;
      el.textContent = '';
      for (const ch of text) {
        const s = document.createElement('span');
        s.setAttribute('data-magnet', '');
        s.textContent = ch;
        s.style.display = 'inline-block';
        s.style.transition = 'transform .15s ease, color .3s ease';
        s.style.willChange = 'transform';
        el.appendChild(s);
      }
      el.dataset.wrapped = '1';
    });
  };

  async function load(url, addHistory) {
    let doc;
    try {
      const res = await fetch(url);
      doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    } catch {
      location.href = url;                                 // fall back to a normal load
      return;
    }

    document.title = doc.title;

    // swap the page-specific <style> blocks (base styles + generated :hover rules)
    document.head.querySelectorAll('style').forEach((s) => s.remove());
    doc.head.querySelectorAll('style').forEach((s) => document.head.appendChild(s.cloneNode(true)));

    // replace the body content, but KEEP the live cursor element alive
    const cursorEls = [...document.querySelectorAll('#ak-cursor-reticle')];
    document.body.innerHTML = doc.body.innerHTML;
    cursorEls.forEach((el) => document.body.appendChild(el));
    document.getElementById('ak-loader')?.remove();        // no loader on in-page nav

    if (addHistory) history.pushState({}, '', url);
    // window.scrollTo(0, 0);

    wrapMagnetWords();

    // re-bind content interactions (initCursor is NOT re-run — the cursor persists)
    initReveal();
    initBottomReveal();
    initPinScroll();
    initMagnetic();

    const hash = new URL(url, location.href).hash;
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
    
    window.__akCursorSync?.();  // reset cursor state for whatever is now under the pointer
  }

  // document.addEventListener('click', (e) => {
  //   const a = e.target.closest('a');
  //   if (!interceptable(a)) return;
  //   e.preventDefault();
  //   if (a.href !== location.href) load(a.href, true);
  // });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || a.tagName !== 'A') return;

    // In-page section link (#about, #work, …): scroll there ourselves instead of
    // relying on the native fragment jump, which is unreliable once history is
    // managed with pushState.
    if (a.hash && a.pathname === location.pathname && a.origin === location.origin) {
      const target = document.getElementById(a.hash.slice(1));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', a.hash);
      }
      return;
    }

    // Internal .html link: in-page content swap.
    if (interceptable(a)) {
      e.preventDefault();
      if (a.href !== location.href) load(a.href, true);
    }
  });
  window.addEventListener('popstate', () => load(location.href, false));
}
