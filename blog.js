(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const header = $(".topbar");
  const navToggle = $(".nav-toggle");
  const navMenu = $("#nav-menu");
  const year = $("#year");
  const modeBtn = $(".mode");

  const listEl = $("#blog-list");
  const emptyEl = $("#blog-empty");
  const searchEl = $("#blog-search");
  const tagEl = $("#blog-tag");

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

  const posts = [
    {
      slug: "kpi-definitions-that-dont-break",
      title: "KPI definitions that don’t break every meeting",
      date: "2025-12-01",
      readMins: 5,
      tags: ["BI", "KPIs", "Stakeholders"],
      excerpt: "A practical framework for KPI definitions that stay consistent across teams, dashboards, and time.",
      content: `
        <p>Most KPI problems aren’t SQL problems. They’re definition problems.</p>
        <p>Good KPIs have a clear grain, clear inclusions/exclusions, and clear ownership. If any of those are fuzzy, your dashboard becomes a debate club.</p>
        <p>My default checklist: metric name, business question, numerator/denominator (if ratio), time window, grain, filters, edge cases, and QA queries.</p>
      `,
    },
    {
      slug: "dashboards-for-executives",
      title: "Dashboards for executives: reduce, don’t decorate",
      date: "2025-11-20",
      readMins: 4,
      tags: ["Dashboards", "Storytelling"],
      excerpt: "How to design dashboards that answer the question in 10 seconds, not 10 minutes.",
      content: `
        <p>Executives scan. They don’t explore. Your dashboard should behave accordingly.</p>
        <p>Lead with 3 to 5 KPIs, then show a trend, then show a breakdown, then offer filters. Anything else is optional.</p>
      `,
    },
    {
      slug: "dimensional-modeling-quick-notes",
      title: "Dimensional modeling quick notes: grain first, always",
      date: "2025-10-28",
      readMins: 6,
      tags: ["Data Modeling", "SQL"],
      excerpt: "If you define grain early, you avoid 80% of downstream BI chaos.",
      content: `
        <p>Define the grain before writing queries. Is the fact table per order, per line item, per session, per day?</p>
        <p>Once grain is stable, dimensions become predictable, and measures become trustworthy.</p>
      `,
    },
  ];

  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  }

  function uniqueTags() {
    const set = new Set();
    posts.forEach(p => p.tags.forEach(t => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  function renderTagOptions() {
    if (!tagEl) return;
    const tags = uniqueTags();
    tags.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      tagEl.appendChild(opt);
    });
  }

  function matches(post, q, tag) {
    const query = (q || "").trim().toLowerCase();
    const hasQuery =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.tags.some(t => t.toLowerCase().includes(query));

    const hasTag = !tag || post.tags.includes(tag);
    return hasQuery && hasTag;
  }

  function postCard(post) {
    const tags = post.tags.map(t => `<span class="tag">${t}</span>`).join("");
    return `
      <article class="card reveal blog-card">
        <div class="blog-head">
          <h3 class="work-title">${post.title}</h3>
          <p class="work-sub">${formatDate(post.date)} • ${post.readMins} min read</p>
        </div>
        <div class="work-tags">${tags}</div>
        <p class="work-text">${post.excerpt}</p>
        <div class="row">
          <a class="btn small ink" href="#${post.slug}">Read</a>
        </div>
      </article>
    `;
  }

  function postView(post) {
    const tags = post.tags.map(t => `<span class="tag">${t}</span>`).join("");
    return `
      <article class="card reveal blog-post">
        <div class="blog-head">
          <h2 class="section-title" style="margin:0;">${post.title}</h2>
          <p class="section-sub" style="margin-top:6px;">${formatDate(post.date)} • ${post.readMins} min read</p>
        </div>
        <div class="work-tags" style="margin-top:10px;">${tags}</div>
        <div class="rule" aria-hidden="true"></div>
        <div class="blog-content">${post.content}</div>
        <div class="rule" aria-hidden="true"></div>
        <div class="row">
          <a class="btn line" href="#list">Back to list</a>
        </div>
      </article>
    `;
  }

  function render() {
    if (!listEl) return;

    const hash = window.location.hash.replace("#", "");
    const q = searchEl ? searchEl.value : "";
    const tag = tagEl ? tagEl.value : "";

    if (hash && hash !== "list") {
      const p = posts.find(x => x.slug === hash);
      if (p) {
        listEl.innerHTML = postView(p);
        if (emptyEl) emptyEl.style.display = "none";
        revealNow();
        return;
      }
    }

    const filtered = posts.filter(p => matches(p, q, tag));
    if (filtered.length === 0) {
      listEl.innerHTML = "";
      if (emptyEl) emptyEl.style.display = "";
      revealNow();
      return;
    }

    if (emptyEl) emptyEl.style.display = "none";
    listEl.innerHTML = `<div id="list" class="blog-list-inner">${filtered.map(postCard).join("")}</div>`;
    revealNow();
  }

  function revealNow() {
    const els = $$(".reveal");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      els.forEach(el => el.classList.add("is-visible"));
      return;
    }
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      els.forEach(el => {
        if (!el.classList.contains("is-visible")) io.observe(el);
      });
    } else {
      els.forEach(el => el.classList.add("is-visible"));
    }
  }

  renderTagOptions();
  render();

  if (searchEl) searchEl.addEventListener("input", () => { window.location.hash = "#list"; render(); });
  if (tagEl) tagEl.addEventListener("change", () => { window.location.hash = "#list"; render(); });

  window.addEventListener("hashchange", () => render());
})();