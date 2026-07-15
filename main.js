/* ============================================================
   BUILT DIFFERENT — main.js
   ============================================================ */

/* ---- Flip this to true ONLY when you have real client results.
        Never populate the results grid with anything invented. ---- */
const RESULTS_LIVE = false;

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupReveal();
  setupForm();
  setupResults();
});

/* -------------------- mobile nav -------------------- */
function setupNav() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  if (!toggle || !menu) return;

  const close = () => {
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };
  const open = () => {
    menu.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
  };

  toggle.addEventListener("click", () => {
    menu.hidden ? open() : close();
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}

/* -------------------- reveal on scroll -------------------- */
function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => io.observe(el));
}

/* -------------------- application form --------------------
   Submits to Netlify Forms via AJAX so the page stays put and
   shows an inline confirmation. Works automatically once the
   site is deployed to Netlify. On local preview the POST will
   fail gracefully (that's expected).                          */
function setupForm() {
  const form = document.getElementById("applyForm");
  if (!form) return;

  const success = document.getElementById("formSuccess");
  const error = document.getElementById("formError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (success) success.hidden = true;
    if (error) error.hidden = true;

    const data = new URLSearchParams(new FormData(form));

    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data.toString(),
      });
      if (!res.ok) throw new Error("bad status");
      form.reset();
      if (success) success.hidden = false;
      success?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      if (error) error.hidden = false;
    }
  });
}

/* -------------------- results toggle -------------------- */
function setupResults() {
  const soon = document.getElementById("resultsSoon");
  const grid = document.getElementById("resultsGrid");
  if (!soon || !grid) return;

  if (RESULTS_LIVE) {
    soon.hidden = true;
    grid.hidden = false;
  } else {
    soon.hidden = false;
    grid.hidden = true;
  }
}
