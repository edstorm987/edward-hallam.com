// Link-tree <-> website mode transition. Loaded in <head> on both pages so the
// arrival cover is in place before first paint. Styles: /mode-transition.css.
(function () {
  var ARRIVE_KEY = "eh-shark-arrive";
  var LEAVE_MS = 1180;
  var ARRIVE_MS = 1000;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  var SHARK =
    '<svg viewBox="0 0 220 90" aria-hidden="true" focusable="false">' +
    '<path fill="#062232" d="M8 47 L-2 18 Q10 34 22 44 C52 30 98 22 146 26 C170 28 192 36 214 46 C196 52 174 58 146 60 C112 64 70 64 30 54 Q14 62 -2 78 Z"/>' +
    '<path fill="#062232" d="M96 27 L114 0 Q118 14 124 27 Z"/>' +
    '<path fill="#0a3448" d="M118 58 L100 82 Q116 72 136 59 Z"/>' +
    '<path fill="#0a3448" d="M44 54 L38 64 Q46 60 54 55 Z"/>' +
    '<path fill="none" stroke="#1d6d86" stroke-width="1.6" stroke-linecap="round" d="M158 36 Q155 44 158 52 M164 35 Q161 43 164 51 M170 35 Q167 42 170 50"/>' +
    '<path fill="#e9fbff" opacity="0.18" d="M30 50 C70 58 120 58 150 54 C176 51 196 48 212 46 C190 54 160 60 130 61 C90 62 56 58 30 52 Z"/>' +
    '<circle cx="190" cy="40" r="2.6" fill="#e9fbff"/>' +
    "</svg>";

  var RING =
    '<svg class="eh-ring" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
    '<defs><linearGradient id="eh-ring-gradient" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#9ff4ff"/><stop offset="0.5" stop-color="#28c3d6"/><stop offset="1" stop-color="#0b5f78"/>' +
    "</linearGradient></defs>" +
    '<circle cx="50" cy="50" r="46"/></svg>';

  function buildSea(kind, x, y) {
    var sea = document.createElement("div");
    sea.className = "eh-sea is-" + kind;
    sea.setAttribute("aria-hidden", "true");
    sea.style.setProperty("--x", x + "%");
    sea.style.setProperty("--y", y + "%");
    var bubbles = "";
    if (kind === "leaving") {
      for (var i = 0; i < 8; i += 1) {
        bubbles += '<span class="eh-bubble" style="left:' + (x - 12 + Math.random() * 24) + "%;top:" +
          (y + 4 + Math.random() * 10) + "%;--s:" + (6 + Math.random() * 12) + "px;--d:" +
          (0.6 + Math.random() * 0.4).toFixed(2) + 's"></span>';
      }
    }
    sea.innerHTML = '<div class="eh-sea-fill"></div>' + (kind === "leaving" ? RING : "") +
      '<div class="eh-shark">' + SHARK + "</div>" + bubbles;
    document.body.appendChild(sea);
    return sea;
  }

  // Arriving: cover the page now (before paint), then let the shark wipe it open.
  var arriving = false;
  try {
    arriving = sessionStorage.getItem(ARRIVE_KEY) === "1";
    sessionStorage.removeItem(ARRIVE_KEY);
  } catch (error) {}

  if (arriving && !reduceMotion) {
    root.classList.add("eh-arriving");
    var start = function () {
      var sea = buildSea("arriving", 50, 50);
      root.classList.remove("eh-arriving");
      window.setTimeout(function () { sea.remove(); }, ARRIVE_MS);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
    // Never leave the page covered if something goes wrong.
    window.setTimeout(function () { root.classList.remove("eh-arriving"); }, 2500);
  }

  // Leaving: play the sweep + shark, then go.
  document.addEventListener("click", function (event) {
    var link = event.target instanceof Element ? event.target.closest("[data-mode-switch]") : null;
    if (!link || reduceMotion) return;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (document.querySelector(".eh-sea.is-leaving")) return;
    var x = Math.round((event.clientX / window.innerWidth) * 100) || 50;
    var y = Math.round((event.clientY / window.innerHeight) * 100) || 50;
    buildSea("leaving", x, y);
    try { sessionStorage.setItem(ARRIVE_KEY, "1"); } catch (error) {}
    window.setTimeout(function () { window.location.href = link.href; }, LEAVE_MS);
  }, true);

  // Coming back via the browser's back button restores a frozen page: clear the sea.
  window.addEventListener("pageshow", function (event) {
    if (!event.persisted) return;
    root.classList.remove("eh-arriving");
    var seas = document.querySelectorAll(".eh-sea");
    for (var i = 0; i < seas.length; i += 1) seas[i].remove();
  });
})();
