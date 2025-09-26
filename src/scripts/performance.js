// Performance optimization script
(function () {
  "use strict";

  // Intersection Observer for lazy loading and animations
  const observerOptions = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-fade-in-up");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.addEventListener("DOMContentLoaded", () => {
    const animatedElements = document.querySelectorAll(".animate-fade-in-up");
    animatedElements.forEach((el) => observer.observe(el));
  });

  // Preload critical resources on hover
  const preloadOnHover = (selector, href) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      el.addEventListener(
        "mouseenter",
        () => {
          const link = document.createElement("link");
          link.rel = "prefetch";
          link.href = href;
          document.head.appendChild(link);
        },
        { once: true }
      );
    });
  };

  // Preload navigation links
  preloadOnHover('a[href="/experience"]', "/experience");
  preloadOnHover('a[href="/blog"]', "/blog");

  // Optimize images
  const optimizeImages = () => {
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.loading) {
        img.loading = "lazy";
      }
      if (!img.decoding) {
        img.decoding = "async";
      }
    });
  };

  // Service Worker registration for caching
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }

  // Initialize optimizations
  document.addEventListener("DOMContentLoaded", () => {
    optimizeImages();
  });

  // Performance monitoring
  if ("performance" in window) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType("navigation")[0];
        console.log("Performance metrics:", {
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          domContentLoaded:
            perfData.domContentLoadedEventEnd -
            perfData.domContentLoadedEventStart,
          firstPaint:
            performance.getEntriesByType("paint")[0]?.startTime || "N/A",
        });
      }, 0);
    });
  }
})();
