/* Algora home: motion and effects. Pure visuals; no data leaves the page. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  /* 1. Candlestick field behind the hero */
  var cv = $("#a-candles");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), bars = [], off = 0, px = 0.5;
    var size = function () { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    var add = function () { var o = px, c = Math.min(0.85, Math.max(0.15, o + (Math.random() - 0.48) * 0.08)); bars.push({ o: o, c: c, h: Math.max(o, c) + Math.random() * 0.03, l: Math.min(o, c) - Math.random() * 0.03 }); px = c; };
    size(); for (var i = 0; i < 80; i++) add();
    window.addEventListener("resize", size);
    var step = 14, last = 0;
    var draw = function (t) {
      if (!reduce) { off += (t - last) * 0.012; last = t; if (off >= step) { off -= step; add(); if (bars.length > 140) bars.shift(); } }
      ctx.clearRect(0, 0, W, H);
      var n = Math.ceil(W / step) + 2, s = Math.max(0, bars.length - n);
      for (var k = s; k < bars.length; k++) {
        var b = bars[k], x = (k - s) * step - off + (W - n * step) + step * 2, up = b.c >= b.o;
        var y = function (v) { return H * 0.15 + (1 - v) * H * 0.75; };
        var fade = Math.min(1, (x / W) * 1.6) * 0.9;
        ctx.globalAlpha = fade * (up ? 0.55 : 0.4);
        ctx.strokeStyle = ctx.fillStyle = up ? "#22d3a0" : "#ff6b70";
        ctx.beginPath(); ctx.moveTo(x + 4, y(b.h)); ctx.lineTo(x + 4, y(b.l)); ctx.stroke();
        var top = y(Math.max(b.o, b.c)); ctx.fillRect(x + 1, top, 6, Math.max(1.5, y(Math.min(b.o, b.c)) - top));
      }
      ctx.globalAlpha = 1;
      if (!reduce) requestAnimationFrame(draw);
    };
    requestAnimationFrame(function (t) { last = t; draw(t); });
  }

  /* 2. Hero console: simulated paper bot */
  var pnlEl = $("#a-pnl"), trEl = $("#a-trades"), winEl = $("#a-win"), log = $("#a-log"), spark = $("#a-spark");
  if (pnlEl && log && spark) {
    var eq = [0], pnl = 0, trades = 0, wins = 0, open = null, price = 24180;
    var fmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
    var rs = function (v) { return (v < 0 ? "−₹" : "₹") + fmt.format(Math.abs(v)); };
    var now = function () { var d = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2); };
    var line = function (html) { var li = document.createElement("li"); li.innerHTML = '<span class="t">' + now() + "</span> " + html; log.appendChild(li); while (log.children.length > 5) log.removeChild(log.firstChild); };
    var drawSpark = function () {
      var lo = Math.min.apply(null, eq), hi = Math.max.apply(null, eq); if (hi - lo < 1) { hi += 1; lo -= 1; }
      var pts = eq.map(function (v, i) { return [(i / Math.max(1, eq.length - 1)) * 400, 8 + ((hi - v) / (hi - lo)) * 94]; });
      var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
      $(".a-spark__line", spark).setAttribute("d", d);
      $(".a-spark__area", spark).setAttribute("d", d + " L400 110 L0 110 Z");
    };
    var tick = function () {
      price += (Math.random() - 0.48) * 9;
      var p = price.toFixed(2);
      if (!open && Math.random() < 0.45) {
        open = { dir: Math.random() < 0.55 ? 1 : -1, px: price };
        line('<b class="b">ENTRY</b> ' + (open.dir > 0 ? '<span class="g">LONG</span>' : '<span class="r">SHORT</span>') + " NIFTY @ " + p);
      } else if (open && Math.random() < 0.4) {
        var pts = (price - open.px) * open.dir + (Math.random() - 0.4) * 14, r = Math.round(pts * 0.5 * 75 - 60);
        trades++; if (r > 0) wins++; pnl += r; eq.push(pnl); if (eq.length > 40) eq.shift();
        line('<b class="b">EXIT</b> ' + (Math.random() < 0.5 ? "target" : "flip") + " @ " + p + ' <span class="' + (r >= 0 ? "g" : "r") + '">' + (r >= 0 ? "+" : "") + rs(r) + "</span>");
        open = null;
        pnlEl.textContent = rs(pnl); pnlEl.className = pnl >= 0 ? "x-up" : "x-down";
        trEl.textContent = trades; winEl.textContent = Math.round((wins / trades) * 100) + "%";
        drawSpark();
      } else {
        line('<span class="t">tick</span> NIFTY ' + p + (open ? ' · open ' + (open.dir > 0 ? "long" : "short") : " · waiting for signal"));
      }
    };
    for (var j = 0; j < 14; j++) { eq.push(eq[eq.length - 1] + (rnd() - 0.38) * 1800); }
    pnl = Math.round(eq[eq.length - 1]); trades = 14; wins = 9;
    pnlEl.textContent = rs(pnl); pnlEl.className = pnl >= 0 ? "x-up" : "x-down"; trEl.textContent = trades; winEl.textContent = "64%";
    drawSpark(); line('<b class="b">BOOT</b> bot started in paper mode'); line('<span class="t">feed</span> NIFTY 15m candles connected');
    if (!reduce) setInterval(tick, 1700);
    var sq = $("#a-sq");
    var cd = function () {
      var d = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000), m = d.getHours() * 60 + d.getMinutes(), t = 15 * 60 + 15;
      var left = (t - m + 1440) % 1440; sq.textContent = Math.floor(left / 60) + "h " + ("0" + (left % 60)).slice(-2) + "m";
    };
    if (sq) { cd(); setInterval(cd, 30000); }
  }

  /* 3. Mini equity curve in the bento */
  var me = $("#a-mini-eq");
  if (me) {
    var v = 0, pts = [], k2;
    for (k2 = 0; k2 <= 60; k2++) { v += (rnd() - 0.42) * 10; pts.push(v); }
    var lo2 = Math.min.apply(null, pts), hi2 = Math.max.apply(null, pts);
    var d2 = pts.map(function (q, i) { return (i ? "L" : "M") + (i * 10) + " " + (10 + ((hi2 - q) / (hi2 - lo2)) * 120).toFixed(1); }).join(" ");
    $("path.l", me).setAttribute("d", d2); $("path.a", me).setAttribute("d", d2 + " L600 140 L0 140 Z");
  }

  /* 4. Text scramble on reveal */
  var GLYPHS = "▲▼01<>/_-=+*#%₹";
  function scramble(el) {
    if (el.dataset.done) return; el.dataset.done = "1";
    var final = el.textContent, len = final.length, frame = 0, total = 28;
    el.setAttribute("aria-label", final);
    var run = function () {
      var out = "", reveal = Math.floor((frame / total) * len);
      for (var i = 0; i < len; i++) {
        var ch = final[i];
        if (i < reveal || ch === " ") out += ch.replace(/&/g, "&amp;").replace(/</g, "&lt;");
        else out += "<i>" + GLYPHS[(Math.random() * GLYPHS.length) | 0] + "</i>";
      }
      el.innerHTML = out; frame++;
      if (frame <= total) requestAnimationFrame(run); else el.textContent = final;
    };
    run();
  }

  /* 5. Observers: scramble, step progress, equity draw */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target; io.unobserve(t);
        if (t.hasAttribute("data-scramble")) { if (!reduce) scramble(t); }
        else if (t.id === "a-steps") {
          var steps = $$(".a-step", t);
          steps.forEach(function (s, i) { setTimeout(function () { s.classList.add("is-on"); t.style.setProperty("--p", i / (steps.length - 1)); }, reduce ? 0 : 350 + i * 450); });
        } else t.classList.add("is-in");
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    $$("[data-scramble]").forEach(function (e) { io.observe(e); });
    ["#a-steps", "#a-mini-eq"].forEach(function (s) { var e = $(s); if (e) io.observe(e); });
  } else { $$(".a-step").forEach(function (s) { s.classList.add("is-on"); }); var m = $("#a-mini-eq"); if (m) m.classList.add("is-in"); }

  /* 6. Spotlight, tilt and magnetic buttons */
  if (fine && !reduce) {
    $$(".a-card").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        c.style.setProperty("--mx", x + "px"); c.style.setProperty("--my", y + "px");
        if (c.classList.contains("a-tilt")) c.style.transform = "perspective(900px) rotateX(" + ((0.5 - y / r.height) * 4).toFixed(2) + "deg) rotateY(" + ((x / r.width - 0.5) * 5).toFixed(2) + "deg) translateY(-2px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
    $$(".a-mag").forEach(function (b) {
      b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)"; });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* 7. Broker chips in the bento */
  var chips = $("#a-chips"), logos = window.ALGORA_LOGOS || {};
  if (chips) [["zerodha", "Personal"], ["upstox", "HUF"], ["angelone", "Spouse"], ["dhan", "Client 1"]].forEach(function (b) {
    var s = document.createElement("span"); s.className = "a-chip";
    var t = document.createElement("span"); t.className = "x-tile x-tile--s"; t.style.width = t.style.height = "22px"; t.style.borderRadius = "50%";
    if (logos[b[0]]) { var im = document.createElement("img"); im.src = logos[b[0]]; im.alt = ""; im.style.width = im.style.height = "16px"; t.appendChild(im); }
    s.appendChild(t); s.appendChild(document.createTextNode(b[1])); chips.appendChild(s);
  });

  /* 8. Strategy templates open the builder pre-filled */
  $$("[data-strategy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var sel = $("#bf-strategy"); if (sel) sel.value = b.getAttribute("data-strategy");
      var tab = $('.x-tabs [data-tab="bots"]'); if (tab) tab.click();
      setTimeout(function () { var h = $("#bot-new-h"); if (h) h.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }, 60);
    });
  });
})();
