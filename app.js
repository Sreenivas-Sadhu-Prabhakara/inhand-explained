/* ============================================================
   inhand explained — scroll-driven animated narrative.
   Pure DOM + SVG, CSP-clean (no inline handlers, no network).
   Everything degrades to a static, legible state under
   prefers-reduced-motion (handled here AND in styles.css).
   ============================================================ */
'use strict';

(function () {
  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Build the salary-waterfall SVG ----------
     Illustrative example: CTC 18,00,000/yr -> ~1,12,900/mo in-hand.
     These are teaching numbers, labelled illustrative in-page. */
  function buildWaterfall() {
    var barsG = document.getElementById('wfBars');
    var connsG = document.getElementById('wfConns');
    if (!barsG || !connsG) return;

    // Monthly figures (rupees) for a 18L CTC, ~40% basic. Illustrative.
    // step label, monthly amount removed (or the running total for CTC/in-hand), kind
    var VB_H = 340, floor = 300, top = 40, usable = floor - top;
    var steps = [
      { label: 'CTC',           running: 150000, kind: 'ctc'  },
      { label: 'Employer EPF',  delta: 1800,     kind: 'drop' },
      { label: 'Gratuity',      delta: 2884,     kind: 'drop' },
      { label: 'Your EPF',      delta: 7200,     kind: 'drop' },
      { label: 'Prof. tax',     delta: 200,      kind: 'drop' },
      { label: 'Income tax',    delta: 25016,    kind: 'drop' },
      { label: 'In-hand',       running: 112900, kind: 'inhand' }
    ];
    var maxVal = 150000;
    var n = steps.length;
    var gap = 22;
    var vbW = 760, padL = 18, padR = 18;
    var barW = Math.floor((vbW - padL - padR - gap * (n - 1)) / n);

    function h(v) { return Math.max(4, Math.round((v / maxVal) * usable)); }
    function rupee(v) { return '₹' + v.toLocaleString('en-IN'); }

    var svgNS = 'http://www.w3.org/2000/svg';
    var running = 150000; // running balance for the floating drop bars
    var prevTopY = null, prevX = null;

    for (var i = 0; i < n; i++) {
      var s = steps[i];
      var x = padL + i * (barW + gap);
      var barH, yTop, isFloat = false, amountShown;

      if (s.kind === 'ctc') {
        barH = h(running); yTop = floor - barH; amountShown = running;
      } else if (s.kind === 'inhand') {
        barH = h(s.running); yTop = floor - barH; amountShown = s.running;
      } else {
        // floating "removed" segment: sits between new running level and old level
        var before = running;
        running = running - s.delta;
        barH = h(s.delta); // height proportional to the amount removed
        yTop = floor - h(before); // top aligns with the previous top
        isFloat = true; amountShown = s.delta;
      }

      // connector from previous bar's top to this bar's top edge
      if (prevTopY !== null) {
        var conn = document.createElementNS(svgNS, 'path');
        var x1 = prevX + barW, y1 = prevTopY, x2 = x, y2 = yTop;
        conn.setAttribute('d', 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2);
        conn.setAttribute('class', 'wf-conn');
        connsG.appendChild(conn);
      }

      var rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', yTop);
      rect.setAttribute('width', barW);
      rect.setAttribute('height', barH);
      rect.setAttribute('rx', 5);
      rect.setAttribute('class', 'wf-bar wf-bar--' + s.kind);
      rect.style.transitionDelay = (0.06 * i) + 's';
      barsG.appendChild(rect);

      // value label above the bar
      var val = document.createElementNS(svgNS, 'text');
      val.setAttribute('x', x + barW / 2);
      val.setAttribute('y', yTop - 8);
      val.setAttribute('text-anchor', 'middle');
      val.setAttribute('class', 'wf-val' + (s.kind === 'inhand' ? ' wf-val--inhand' : ''));
      val.textContent = (isFloat ? '−' : '') + rupee(amountShown);
      barsG.appendChild(val);

      // step label below the floor
      var cap = document.createElementNS(svgNS, 'text');
      cap.setAttribute('x', x + barW / 2);
      cap.setAttribute('y', floor + 20);
      cap.setAttribute('text-anchor', 'middle');
      cap.setAttribute('class', 'wf-cap');
      cap.textContent = s.label;
      barsG.appendChild(cap);

      prevTopY = yTop; prevX = x;
    }

    // baseline
    var base = document.createElementNS(svgNS, 'line');
    base.setAttribute('x1', padL); base.setAttribute('x2', vbW - padR);
    base.setAttribute('y1', floor + 0.5); base.setAttribute('y2', floor + 0.5);
    base.setAttribute('stroke', 'var(--line)'); base.setAttribute('stroke-width', '1');
    connsG.appendChild(base);

    void VB_H; // silence unused
  }

  /* ---------- 2. Reveal on scroll (IntersectionObserver) ---------- */
  function wireReveals() {
    var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    var wfEls = Array.prototype.slice.call(
      document.querySelectorAll('.wf-bar, .wf-conn, .wf-cap, .wf-val'));

    if (reduce || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-in'); });
      wfEls.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { io.observe(el); });

    // Anything already within the viewport at load reveals right away (no scroll needed),
    // so the hero is never stuck faded — including in a headless screenshot capture.
    function revealVisible() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) { el.classList.add('is-in'); io.unobserve(el); }
      });
    }
    revealVisible();
    window.requestAnimationFrame(revealVisible);
    window.addEventListener('load', revealVisible);
    // Failsafe: never leave content invisible if an observer callback is missed.
    setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('is-in'); }); }, 1200);

    // Waterfall parts animate together when the chart enters view.
    var wf = document.getElementById('wfSvg');
    if (wf) {
      var wfIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            wfEls.forEach(function (el) { el.classList.add('is-in'); });
            wfIo.disconnect();
          }
        });
      }, { threshold: 0.25 });
      wfIo.observe(wf);
    }
  }

  /* ---------- 3. Scroll progress bar ---------- */
  function wireProgress() {
    var bar = document.getElementById('progressBar');
    if (!bar) return;
    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop || document.body.scrollTop) / max * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- 4. Privacy packet demo (only when in view) ---------- */
  function wirePrivacyDemo() {
    var packet = document.getElementById('pdPacket');
    var wall = document.getElementById('pdWall');
    if (!packet || !wall) return;
    if (reduce || !('IntersectionObserver' in window)) return; // static in styles.css

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          packet.classList.add('is-run');
          wall.classList.add('is-hit');
        } else {
          packet.classList.remove('is-run');
          wall.classList.remove('is-hit');
        }
      });
    }, { threshold: 0.4 });
    io.observe(document.getElementById('privacyDemo'));
  }

  /* ---------- boot ---------- */
  function init() {
    buildWaterfall();
    wireReveals();
    wireProgress();
    wirePrivacyDemo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
