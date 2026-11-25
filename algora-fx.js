/* Algora home: small, purposeful motion. Every number here is simulated and labelled so on the page. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var seed = 11; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var ist = function () { return new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000); };
  var pad = function (n) { return ("0" + n).slice(-2); };
  var hms = function () { var d = ist(); return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()); };
  var fmt2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* 1. IST clock in the hero meta row and the tape */
  var clk = $("#ed-ist"), tt = $("#ed-tape-t");
  function clock() { var t = hms(); if (clk) clk.textContent = t; if (tt) tt.textContent = t + " IST"; }
  clock(); setInterval(clock, 1000);

  /* 2. Hero equity curve: built once from a seeded walk, drawn once */
  var eq = $("#ed-eq");
  if (eq) {
    var W = 600, H = 200, pts = [], v = 0, i;
    for (i = 0; i <= 126; i++) { v += (rnd() - 0.43) * 1500; pts.push(v); }
    var lo = Math.min(0, Math.min.apply(null, pts)), hi = Math.max.apply(null, pts);
    var y = function (q) { return 10 + ((hi - q) / (hi - lo)) * (H - 20); };
    var d = pts.map(function (q, k) { return (k ? "L" : "M") + ((k / (pts.length - 1)) * W).toFixed(1) + " " + y(q).toFixed(1); }).join(" ");
    $(".ed-eq__line", eq).setAttribute("d", d);
    $(".ed-eq__area", eq).setAttribute("d", d + " L" + W + " " + y(lo) + " L0 " + y(lo) + " Z");
    var g = $(".ed-eq__grid", eq), ns = "http://www.w3.org/2000/svg";
    for (i = 1; i < 4; i++) { var ln = document.createElementNS(ns, "line"); ln.setAttribute("x1", 0); ln.setAttribute("x2", W); ln.setAttribute("y1", i * H / 4); ln.setAttribute("y2", i * H / 4); g.appendChild(ln); }
    for (i = 1; i < 6; i++) { var lv = document.createElementNS(ns, "line"); lv.setAttribute("y1", 0); lv.setAttribute("y2", H); lv.setAttribute("x1", i * W / 6); lv.setAttribute("x2", i * W / 6); g.appendChild(lv); }
    var z = document.createElementNS(ns, "line"); z.setAttribute("class", "z"); z.setAttribute("x1", 0); z.setAttribute("x2", W); z.setAttribute("y1", y(0)); z.setAttribute("y2", y(0)); g.appendChild(z);
    var box = eq.parentNode;
    var fxOn = document.documentElement.classList.contains("fx");
    requestAnimationFrame(function () { setTimeout(function () { box.classList.add("is-drawn"); }, reduce ? 0 : (fxOn ? 950 : 250)); });
  }

  /* 3. Simulated price tape: mono, ticks in place, no scrolling */
  var tape = $("#ed-tape");
  if (tape) {
    var syms = [["NIFTY", 24182.35], ["BANKNIFTY", 51904.1], ["FINNIFTY", 23411.6], ["CRUDEOIL", 6012], ["GOLD", 76240], ["RELIANCE", 1288.45], ["HDFCBANK", 1742.3]];
    var state = syms.map(function (s) {
      var el = document.createElement("span");
      el.innerHTML = "<b></b><span class=\"tk\"></span><em></em>";
      tape.appendChild(el);
      return { name: s[0], open: s[1], px: s[1] * (1 + (rnd() - 0.5) * 0.008), el: el };
    });
    var paint = function (s, dir) {
      var ch = (s.px - s.open) / s.open * 100, tk = $(".tk", s.el), em = $("em", s.el);
      $("b", s.el).textContent = s.name;
      tk.textContent = fmt2.format(s.px);
      em.textContent = (ch >= 0 ? "+" : "−") + Math.abs(ch).toFixed(2) + "%";
      em.className = ch >= 0 ? "x-up" : "x-down";
      if (dir) { clearTimeout(s.ft); tk.className = "tk " + (dir > 0 ? "up" : "dn"); s.ft = setTimeout(function () { tk.className = "tk " + (dir > 0 ? "was-up" : "was-dn"); }, 150); }
    };
    state.forEach(function (s) { paint(s, 0); });
    if (!reduce) setInterval(function () {
      var s = state[(Math.random() * state.length) | 0], step = s.open * (Math.random() - 0.5) * 0.0009;
      s.px += step; paint(s, step >= 0 ? 1 : -1);
    }, 900);
  }

  /* 4. Feature equity line: drawn once when it scrolls into view */
  var me = $("#a-mini-eq");
  if (me) {
    var v2 = 0, p2 = [], k2;
    for (k2 = 0; k2 <= 60; k2++) { v2 += (rnd() - 0.44) * 10; p2.push(v2); }
    var lo2 = Math.min(0, Math.min.apply(null, p2)), hi2 = Math.max.apply(null, p2);
    var y2 = function (q) { return 8 + ((hi2 - q) / (hi2 - lo2)) * 124; };
    $("path.l", me).setAttribute("d", p2.map(function (q, i2) { return (i2 ? "L" : "M") + (i2 * 10) + " " + y2(q).toFixed(1); }).join(" "));
    $("path.z", me).setAttribute("d", "M0 " + y2(0).toFixed(1) + " H600");
    if ("IntersectionObserver" in window && !reduce) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { me.classList.add("is-in"); io.disconnect(); } }); }, { rootMargin: "0px 0px -15% 0px" });
      io.observe(me);
    } else me.classList.add("is-in");
  }

  /* 5. Broker account chips in the features grid */
  var chips = $("#a-chips"), logos = window.ALGORA_LOGOS || {};
  if (chips) [["zerodha", "Personal"], ["upstox", "HUF"], ["angelone", "Spouse"], ["dhan", "Client 1"]].forEach(function (b) {
    var s = document.createElement("span"); s.className = "a-chip";
    var t = document.createElement("span"); t.className = "x-tile x-tile--s"; t.style.width = t.style.height = "20px";
    if (logos[b[0]]) { var im = document.createElement("img"); im.src = logos[b[0]]; im.alt = ""; im.style.width = im.style.height = "15px"; t.appendChild(im); }
    s.appendChild(t); s.appendChild(document.createTextNode(b[1])); chips.appendChild(s);
  });

  /* 6. Strategy templates open the builder pre-filled */
  $$("[data-strategy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var sel = $("#bf-strategy"); if (sel) sel.value = b.getAttribute("data-strategy");
      var tab = $('.x-tabs [data-tab="bots"]'); if (tab) tab.click();
      setTimeout(function () { var h = $("#bot-new-h"); if (h) h.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }, 60);
    });
  });
})();

/* ===== Home motion: runs once, transform/opacity only, off under reduced motion ===== */
(function () {
  "use strict";
  var html = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var home = $("#tab-home");
  if (!home) { window.__algoraFx = true; return; }
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var raf = window.requestAnimationFrame.bind(window);
  var later = function (fn, ms) { return setTimeout(fn, ms); };

  try {
    var fx = html.classList.contains("fx") && !reduce;
    var hasIO = "IntersectionObserver" in window;

    /* Once-only viewport trigger */
    var onEnter = function (els, fn, margin) {
      if (!els.length) return;
      if (!hasIO) { fn(els); return; }
      var io = new IntersectionObserver(function (es) {
        var hit = es.filter(function (e) { return e.isIntersecting; }).map(function (e) { io.unobserve(e.target); return e.target; });
        if (hit.length) fn(hit);
      }, { rootMargin: margin || "0px 0px -10% 0px" });
      els.forEach(function (el) { io.observe(el); });
    };

    /* ---- Decode effect on mono labels: same-class characters only, so widths never change ---- */
    var UP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", LO = "abcdefghijklmnopqrstuvwxyz", DG = "0123456789";
    function scramble(el) {
      if (reduce || el.__fxs) return; el.__fxs = true;
      var nodes = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      while (w.nextNode()) if (w.currentNode.nodeValue.trim()) nodes.push(w.currentNode);
      var items = nodes.map(function (n) { return { n: n, o: n.nodeValue }; });
      var total = items.reduce(function (a, it) { return a + it.o.length; }, 0) || 1, dur = 420, t0 = null, frame = 0;
      function pick(c) {
        var set = UP.indexOf(c) > -1 ? UP : LO.indexOf(c) > -1 ? LO : DG.indexOf(c) > -1 ? DG : null;
        return set ? set[(Math.random() * set.length) | 0] : c;
      }
      function step(t) {
        t0 = t0 || t; var p = (t - t0) / dur, k = 0;
        if (frame++ % 2 === 0 || p >= 1) items.forEach(function (it) {
          var out = "";
          for (var i = 0; i < it.o.length; i++, k++) out += p >= 1 || k / total < (p - 0.25) / 0.75 ? it.o[i] : pick(it.o[i]);
          it.n.nodeValue = out;
        });
        if (p < 1) raf(step);
      }
      raf(step);
    }

    /* ---- Mask reveal: wrap rendered lines, slide them up, then restore the original markup ---- */
    function splitLines(h) {
      if (h.__orig == null) h.__orig = h.innerHTML;
      h.innerHTML = h.__orig;
      var units = [];
      Array.prototype.slice.call(h.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          n.nodeValue.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { units.push(document.createTextNode(" ")); return; }
            var s = document.createElement("span"); s.textContent = part; s.__w = true; units.push(s);
          });
        } else units.push(n.cloneNode(true));
      });
      h.innerHTML = ""; units.forEach(function (u) { h.appendChild(u); });
      var lines = [], top = null;
      units.forEach(function (u) {
        if (u.nodeType === 3) { if (lines.length) lines[lines.length - 1].push(u); return; }
        var y = Math.round(u.getBoundingClientRect().top);
        if (top === null || Math.abs(y - top) > 4) { lines.push([]); top = y; }
        lines[lines.length - 1].push(u);
      });
      h.innerHTML = "";
      lines.forEach(function (line, i) {
        while (line.length && line[line.length - 1].nodeType === 3) line.pop();
        var m = document.createElement("span"), inner = document.createElement("span");
        m.className = "fx-l"; m.style.setProperty("--li", i);
        line.forEach(function (u) { inner.appendChild(u.__w ? document.createTextNode(u.textContent) : u); });
        m.appendChild(inner); h.appendChild(m);
      });
      h.classList.add("fx-split");
      return lines.length;
    }
    function revealHeading(h, after) {
      if (!fx) { if (after) after(); return; }
      var n = splitLines(h);
      raf(function () { raf(function () {
        h.classList.add("fx-in");
        later(function () {
          h.innerHTML = h.__orig; h.classList.add("fx-done"); h.classList.remove("fx-split", "fx-in");
          if (after) after();
        }, 700 + (n - 1) * 90 + 60);
      }); });
    }

    /* ---- Count-up in place, short ---- */
    var inr = function (dec) { return new Intl.NumberFormat("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
    function countUp(el, ms, delay) {
      var m = /^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/.exec(el.textContent.trim());
      if (!m || reduce) return;
      var end = parseFloat(m[2].replace(/,/g, "")), dec = (m[2].split(".")[1] || "").length, f = inr(dec), t0 = null, fin = el.textContent;
      el.textContent = m[1] + f.format(0) + m[3];
      function step(t) {
        t0 = t0 || t; var p = Math.min((t - t0) / ms, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = p < 1 ? m[1] + f.format(end * e) + m[3] : fin;
        if (p < 1) raf(step);
      }
      later(function () { raf(step); }, delay || 0);
    }

    /* ---- 1. Scroll progress bar ---- */
    var bar = document.createElement("div"); bar.className = "fx-progress"; bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    /* ---- 2. Hero sequence ---- */
    var hero = $("#hero"), h1 = $(".ed-h1", hero), app = $(".ed-app", hero);
    $$(".ed-kv tr", app).forEach(function (tr, i) { tr.style.setProperty("--d", i * 45); });
    $$(".ed-trades tbody tr", app).forEach(function (tr, i) { tr.style.setProperty("--d", i * 90); });
    if (h1) h1.classList.add("fx-h");
    function heroGo() {
      $$(".ed-hero__meta > span:first-child, .ed-hero__clock", hero).forEach(function (el) {
        var label = el.classList.contains("ed-hero__clock") ? el.firstChild : el;
        if (label && label.nodeType === 3) { var s = document.createElement("span"); label.parentNode.insertBefore(s, label); s.appendChild(label); label = s; }
        scramble(label);
      });
      revealHeading(h1, function () { raf(function () { h1.classList.add("fx-ul"); }); });
      if (!fx) return;
      $$(".ed-kpis b", app).forEach(function (b) { countUp(b, 900, 720); });
      later(function () { hero.classList.add("fx-copy"); }, 300);
      later(function () { app.classList.add("fx-in"); $$(".ed-sim, .ed-tape__tag", app).forEach(scramble); }, 480);
      later(function () { app.classList.add("fx-rules"); }, 680);
      later(function () { app.classList.add("fx-trades"); }, 1050);
    }
    if (h1 && app) {
      var started = false, go = function () { if (!started) { started = true; heroGo(); } };
      if (fx && document.fonts && document.fonts.ready) { document.fonts.ready.then(go); later(go, 900); } else go();
    }

    /* ---- 3. Section heads: rule draws, number decodes, heading lines rise ---- */
    var heads = $$(".ed-head", home).concat($$(".ed-final > div:first-child", home));
    heads.forEach(function (hd) { var h = $(".ed-h2", hd); if (h && fx) h.classList.add("fx-h"); });
    onEnter(heads, function (hit) {
      hit.forEach(function (hd) {
        hd.classList.add("fx-in");
        var num = $(".ed-num", hd); if (num) scramble(num);
        var h = $(".ed-h2", hd); if (h) revealHeading(h);
      });
    });
    var rules = $$(".ed-sec, .ed-final, .ed-pipe, .ed-tablewrap, .a-faq, .ed-clauses", home);
    rules.forEach(function (r) { r.classList.add("fx-rule"); });
    if (fx) onEnter(rules, function (hit) { hit.forEach(function (r) { r.classList.add("fx-in"); }); }, "0px 0px -6% 0px");
    onEnter($$(".ed-feat .ed-sim, .ed-strip__label", home), function (hit) { hit.forEach(scramble); });

    /* ---- 4. Cards, rows and cells: staggered once on entry ---- */
    var rows = $$(".ed-pipe > li, .ed-tbl tbody tr, .a-faq > details, .ed-clauses > li", home);
    var cells = $$(".ed-feat > article, #broker-grid > .x-broker", home);
    if (fx) {
      rows.forEach(function (el) { el.classList.add("fx-item"); });
      cells.forEach(function (el) { el.classList.add("fx-cell"); });
      onEnter(rows.concat(cells), function (hit) {
        hit.sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
        hit.forEach(function (el, k) { el.style.setProperty("--d", Math.min(k, 8) * 60 + "ms"); el.classList.add("fx-in"); });
      }, "0px 0px -6% 0px");
    }

    /* Hover spotlight follows the cursor */
    cells.forEach(function (c) { c.classList.add("fx-card"); });
    if (finePointer && !reduce) cells.forEach(function (c) {
      var q = null;
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        if (q) return; q = raf(function () { q = null; c.style.setProperty("--mx", x + "px"); c.style.setProperty("--my", y + "px"); });
      });
    });

    /* ---- 5. Magnetic primary CTA (desktop, max 4px) ---- */
    var cta = $(".ed-hero__side .ed-btn--solid", hero);
    if (cta && finePointer && !reduce) {
      cta.classList.add("fx-magnet");
      var zone = cta.parentNode, mq = null;
      zone.addEventListener("pointermove", function (e) {
        var r = cta.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var dx = (e.clientX - cx) / (r.width / 2 + 24), dy = (e.clientY - cy) / (r.height / 2 + 24);
        var inside = Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
        if (mq) cancelAnimationFrame(mq);
        mq = raf(function () { cta.style.transform = inside ? "translate3d(" + (dx * 4).toFixed(2) + "px," + (dy * 4).toFixed(2) + "px,0)" : ""; });
      });
      zone.addEventListener("pointerleave", function () { cta.style.transform = ""; });
    }

    /* ---- 6. Pipeline progress line, scroll-linked, only ever moves forward ---- */
    var pipe = $(".ed-pipe", home), steps = pipe ? $$(":scope > li", pipe) : [], line = null, fill = null, prog = 0;
    function layoutPipe() {
      if (!pipe || steps.length < 2) return;
      var nums = steps.map(function (li) { return $(".ed-pipe__n", li); });
      var pr = pipe.getBoundingClientRect(), a = nums[0].getBoundingClientRect(), b = nums[nums.length - 1].getBoundingClientRect();
      var rg = document.createRange(); rg.selectNodeContents(nums[0]); var tr = rg.getBoundingClientRect();
      if (!line) { line = document.createElement("span"); line.className = "fx-pipe"; line.setAttribute("aria-hidden", "true"); fill = document.createElement("i"); line.appendChild(fill); pipe.appendChild(line); nums.forEach(function (n) { n.classList.add("fx-bg"); }); }
      line.style.left = (tr.left + tr.width / 2 - pr.left - 0.5).toFixed(1) + "px";
      line.style.top = (a.top - pr.top + a.height / 2).toFixed(1) + "px";
      line.style.height = Math.max(0, b.top - a.top).toFixed(1) + "px";
    }

    /* ---- One scroll loop: page progress and pipeline ---- */
    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      raf(function () {
        ticking = false;
        var de = document.documentElement, max = de.scrollHeight - window.innerHeight;
        bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0).toFixed(4) + ")";
        if (line && !home.hidden) {
          var r = line.getBoundingClientRect(), anchor = window.innerHeight * 0.6;
          var p = r.height ? Math.min(1, Math.max(0, (anchor - r.top) / r.height)) : 0;
          if (reduce || !fx) p = 1;
          if (p > prog) { prog = p; fill.style.transform = "scaleY(" + prog.toFixed(4) + ")"; }
          steps.forEach(function (li) { if (!li.classList.contains("fx-lit") && $(".ed-pipe__n", li).getBoundingClientRect().top <= Math.max(anchor, r.top + prog * r.height + 1)) li.classList.add("fx-lit"); });
        }
      });
    }
    layoutPipe();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layoutPipe(); onScroll(); });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { layoutPipe(); onScroll(); });
    document.addEventListener("click", function (e) { if (e.target.closest("[data-tab],[data-goto],[data-goto-anchor]")) later(function () { layoutPipe(); onScroll(); }, 60); });
    onScroll();

    /* ---- 7. FAQ: animated open and close ---- */
    if (!reduce && Element.prototype.animate) $$(".a-faq details", home).forEach(function (d) {
      var s = $("summary", d), body = $("p", d), anim = null, want = d.open;
      s.addEventListener("click", function (e) {
        e.preventDefault();
        var from = d.getBoundingClientRect().height;
        if (anim) anim.cancel();
        want = !want;
        d.style.overflow = "hidden";
        if (want) d.open = true;
        var to = want ? d.getBoundingClientRect().height : s.getBoundingClientRect().height + 1;
        anim = d.animate({ height: [from + "px", to + "px"] }, { duration: 320, easing: "cubic-bezier(0.2, 0.7, 0.1, 1)" });
        if (want && body) body.animate({ opacity: [0, 1], transform: ["translateY(-4px)", "none"] }, { duration: 320, easing: "ease-out" });
        anim.onfinish = function () { anim = null; if (!want) d.open = false; d.style.overflow = ""; };
      });
    });

    window.__algoraFx = true;
  } catch (err) {
    window.__algoraFx = true;
    html.classList.remove("fx");
    if (window.console) console.error("algora motion:", err);
  }
})();
