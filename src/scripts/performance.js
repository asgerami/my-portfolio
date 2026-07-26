// Performance optimization + progressive-enhancement script.
//
// Everything that touches the DOM lives in an idempotent init function bound to
// BOTH `DOMContentLoaded` (hard load / no ClientRouter) and `astro:page-load`
// (initial load *and* every client-side navigation once View Transitions are
// enabled). Observers are disconnected before re-binding so repeated init calls
// never stack up.
(function () {
  "use strict";

  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  // True when the browser can run the CSS `animation-timeline: view()` reveals
  // defined in global.css. When it can, JavaScript must NOT also drive the
  // reveal or the two paths fight over opacity/transform.
  var hasViewTimeline =
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("animation-timeline: view()");

  var revealObserver = null;
  var railObserver = null;

  // ---------------------------------------------------------------------
  // Scroll reveal (fallback path only)
  // ---------------------------------------------------------------------
  function initReveal() {
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }

    var sections = document.querySelectorAll(".section-reveal");

    // CSS handles it, or the user asked for reduced motion: leave the markup
    // alone. `.js-reveal` is never set on <html> in those cases, so the
    // sections are plain visible content.
    if (hasViewTimeline || reduceMotionQuery.matches) {
      sections.forEach(function (el) {
        el.classList.remove("is-visible");
      });
      return;
    }

    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          if (revealObserver) revealObserver.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -80px 0px", threshold: 0 }
    );

    sections.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // ---------------------------------------------------------------------
  // Index rail: highlight whichever section is currently in view
  // ---------------------------------------------------------------------
  function initRail() {
    if (railObserver) {
      railObserver.disconnect();
      railObserver = null;
    }

    var railLinks = document.querySelectorAll(".index-rail__item");
    if (!railLinks.length) return;

    railObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = document.querySelector(
            '.index-rail__item[data-rail-target="' + entry.target.id + '"]'
          );
          if (!link) return;
          link.classList.toggle("is-active", entry.isIntersecting);
        });
      },
      { root: null, rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    railLinks.forEach(function (link) {
      var target = document.getElementById(link.dataset.railTarget || "");
      if (target) railObserver.observe(target);
    });
  }

  // ---------------------------------------------------------------------
  // Misc
  // ---------------------------------------------------------------------
  function optimizeImages() {
    document.querySelectorAll("img").forEach(function (img) {
      if (!img.loading) img.loading = "lazy";
      if (!img.decoding) img.decoding = "async";
    });
  }

  function preloadOnHover(selector, href) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (el.dataset.preloadBound) return;
      el.dataset.preloadBound = "1";
      el.addEventListener(
        "mouseenter",
        function () {
          var link = document.createElement("link");
          link.rel = "prefetch";
          link.href = href;
          document.head.appendChild(link);
        },
        { once: true }
      );
    });
  }

  function init() {
    initReveal();
    initRail();
    optimizeImages();
    preloadOnHover('a[href="/experience"]', "/experience");
    preloadOnHover('a[href="/blog"]', "/blog");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  // Fires on the initial load and after every client-side navigation.
  document.addEventListener("astro:page-load", init);

  // Re-evaluate when the user flips their motion preference mid-session.
  if (typeof reduceMotionQuery.addEventListener === "function") {
    reduceMotionQuery.addEventListener("change", initReveal);
  }

  // Service Worker registration for caching
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {
        /* offline caching is a nice-to-have; never surface a failure */
      });
    });
  }
})();
