/* ============================================
   LingoKey Landing Page — Main Script
   Theme toggle, mobile nav, scroll reveal
   ============================================ */

(function () {
  "use strict";

  /* ---------- Theme ---------- */
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;
  const storedTheme = localStorage.getItem("lingokey-landing-theme");

  function applyTheme(theme) {
    if (theme === "light") {
      html.classList.add("light");
    } else {
      html.classList.remove("light");
    }
    localStorage.setItem("lingokey-landing-theme", theme);
  }

  // Default to dark (matching app default)
  applyTheme(storedTheme === "light" ? "light" : "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isLight = html.classList.contains("light");
      applyTheme(isLight ? "dark" : "light");
    });
  }

  /* ---------- Language ---------- */
  const langToggle = document.getElementById("langToggle");
  if (langToggle && typeof toggleLanguage === "function") {
    langToggle.addEventListener("click", toggleLanguage);
  }

  /* ---------- Mobile Nav ---------- */
  const navMobileToggle = document.getElementById("navMobileToggle");
  const navMobileMenu = document.getElementById("navMobileMenu");

  if (navMobileToggle && navMobileMenu) {
    navMobileToggle.addEventListener("click", () => {
      navMobileMenu.classList.toggle("open");
    });

    navMobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMobileMenu.classList.remove("open");
      });
    });
  }

  /* ---------- Scroll Reveal ---------- */
  const revealElements = document.querySelectorAll(
    ".section-header, .feature-card, .workflow-step, .hotkeys-card, .download-card, .hero-badge, .hero-title, .hero-subtitle, .hero-actions, .hero-meta"
  );

  revealElements.forEach((el) => el.classList.add("reveal"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ---------- Navbar scroll shadow ---------- */
  const navbar = document.getElementById("navbar");
  let lastScroll = 0;

  function onScroll() {
    const y = window.scrollY;
    if (navbar) {
      if (y > 20) {
        navbar.style.borderColor = `rgb(var(--border) / 0.7)`;
      } else {
        navbar.style.borderColor = `rgb(var(--border) / 0.5)`;
      }
    }
    lastScroll = y;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
})();
