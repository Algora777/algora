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
    requestAnimationFrame(function () { setTimeout(function () { box.classList.add("is-drawn"); }, reduce ? 0 : 250); });
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
      if (dir) { tk.className = "tk " + (dir > 0 ? "up" : "dn"); setTimeout(function () { tk.className = "tk"; }, 60); }
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
