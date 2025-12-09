(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const header = $(".topbar");
  const navToggle = $(".nav-toggle");
  const navMenu = $("#nav-menu");
  const navLinks = $$(".nav-link");
  const year = $("#year");
  const modeBtn = $(".mode");

  const form = document.querySelector(".form");
  const formStatus = $("#form-status");

  if (year) year.textContent = String(new Date().getFullYear());

  function setElevated() {
    if (!header) return;
    header.classList.toggle("is-elevated", window.scrollY > 10);
  }
  setElevated();
  window.addEventListener("scroll", setElevated, { passive: true });

  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.contains("is-open") ? closeMenu() : openMenu();
    });

    document.addEventListener("click", (e) => {
      const t = e.target;
      const inside = navMenu.contains(t) || navToggle.contains(t);
      if (!inside) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  navLinks.forEach((a) => {
    a.addEventListener("click", () => closeMenu());
  });

  const revealEls = $$(".reveal");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Active section highlight (only for in-page anchors)
  const sectionIds = navLinks
    .map((a) => a.getAttribute("href") || "")
    .filter((h) => h.startsWith("#"))
    .map((h) => h.slice(1));

  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((a) => {
            const href = a.getAttribute("href") || "";
            if (!href.startsWith("#")) return;
            a.classList.toggle("is-active", href.slice(1) === id);
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  function getTheme() {
    const stored = localStorage.getItem("theme");
    if (stored === "parchment" || stored === "ink") return stored;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "ink" : "parchment";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (modeBtn) modeBtn.setAttribute("aria-label", `Toggle appearance (current: ${theme})`);
  }

  setTheme(getTheme());

  if (modeBtn) {
    modeBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "parchment";
      setTheme(current === "parchment" ? "ink" : "parchment");
    });
  }

  // Contact form UX (Formspree recommended)
  if (form) {
    form.addEventListener("submit", async (e) => {
      const action = form.getAttribute("action") || "";
      const isFormspree = action.includes("formspree.io");

      if (!isFormspree) return;

      e.preventDefault();
      if (formStatus) formStatus.textContent = "Sending…";

      try {
        const fd = new FormData(form);
        const res = await fetch(action, {
          method: "POST",
          body: fd,
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          form.reset();
          if (formStatus) formStatus.textContent = "Sent. I’ll reply soon.";
        } else {
          if (formStatus) formStatus.textContent = "Couldn’t send. Use the email icon.";
        }
      } catch {
        if (formStatus) formStatus.textContent = "Network issue. Use the email icon.";
      }

      setTimeout(() => {
        if (formStatus) formStatus.textContent = "";
      }, 3500);
    });
  }
})();