/* ============================================================
   BUILT DIFFERENT: main.js
   ============================================================ */

/* ---- Flip this to true ONLY when you have real client results.
        Never populate the results grid with anything invented. ---- */
const RESULTS_LIVE = false;

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupReveal();
  setupForm();
  setupResults();
  setupSeparators();
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

  // Esc closes and returns focus to the toggle
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      close();
      toggle.focus();
    }
  });

  // Tapping anywhere outside the menu and toggle closes it
  document.addEventListener("click", (e) => {
    if (menu.hidden) return;
    if (menu.contains(e.target) || toggle.contains(e.target)) return;
    close();
  });
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
   fail gracefully (that's expected).

   Validation is custom (form has novalidate): each required
   field shows an inline error under it instead of the browser
   bubble. Status changes are announced via #formStatus.       */
function setupForm() {
  const form = document.getElementById("applyForm");
  if (!form) return;

  const success = document.getElementById("formSuccess");
  const error = document.getElementById("formError");
  const status = document.getElementById("formStatus");
  const button = document.getElementById("applySubmit");
  const buttonLabel = button ? button.textContent : "";
  const required = [...form.querySelectorAll("[required]")];
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  let sending = false;

  const announce = (msg) => {
    if (!status) return;
    status.textContent = "";
    // Next frame so repeated messages are still announced
    requestAnimationFrame(() => (status.textContent = msg));
  };

  const fieldError = (input) => document.getElementById(input.id + "-error");

  const isValid = (input) => {
    const v = input.value.trim();
    if (!v) return false;
    if (input.type === "email") return emailOk(v);
    return true;
  };

  const showError = (input, show) => {
    const msg = fieldError(input);
    input.setAttribute("aria-invalid", show ? "true" : "false");
    if (!msg) return;
    msg.textContent = show ? msg.dataset.msg : "";
    msg.hidden = !show;
  };

  // Clear a field's error as soon as it becomes valid
  required.forEach((input) => {
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true" && isValid(input)) showError(input, false);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return;
    if (error) error.hidden = true;

    const invalid = required.filter((input) => !isValid(input));
    required.forEach((input) => showError(input, invalid.includes(input)));
    if (invalid.length) {
      invalid[0].focus();
      announce(
        invalid.length === 1
          ? "One field needs attention."
          : invalid.length + " fields need attention."
      );
      return;
    }

    sending = true;
    if (button) {
      button.disabled = true;
      button.textContent = "Sending...";
    }

    const data = new URLSearchParams(new FormData(form));

    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data.toString(),
      });
      if (!res.ok) throw new Error("bad status");
      form.reset();
      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: "smooth", block: "center" });
        success.focus({ preventScroll: true });
      }
      announce("Application received. I read every one myself and will reply within 48 hours.");
    } catch (err) {
      sending = false;
      if (button) {
        button.disabled = false;
        button.textContent = buttonLabel;
      }
      if (error) error.hidden = false;
      announce(error ? error.textContent.trim() : "Something went wrong sending that.");
    }
  });
}

/* -------------------- results toggle --------------------
   Off by default: the Results section and its nav links stay
   hidden until RESULTS_LIVE is true.                          */
function setupResults() {
  const section = document.getElementById("results");
  const soon = document.getElementById("resultsSoon");
  const grid = document.getElementById("resultsGrid");
  const links = document.querySelectorAll("[data-results-link]");

  if (section) section.hidden = !RESULTS_LIVE;
  links.forEach((a) => (a.hidden = !RESULTS_LIVE));
  if (!soon || !grid) return;

  if (RESULTS_LIVE) {
    soon.hidden = true;
    grid.hidden = false;
  } else {
    soon.hidden = false;
    grid.hidden = true;
  }
}

/* -------------------- strip separators --------------------
   The proof strip and credentials wrap on narrow screens. Hide
   any "/" or "·" separator that would sit at the start or end
   of a line, so separators only ever appear between items.    */
function setupSeparators() {
  const seps = document.querySelectorAll(".strip__dot, .credentials__dot");
  if (!seps.length) return;

  const update = () => {
    seps.forEach((sep) => sep.classList.remove("is-edge"));
    seps.forEach((sep) => {
      const prev = sep.previousElementSibling;
      const next = sep.nextElementSibling;
      if (!prev || !next) return;
      const top = sep.getBoundingClientRect().top;
      const sameLine = (el) => Math.abs(el.getBoundingClientRect().top - top) < 4;
      if (!sameLine(prev) || !sameLine(next)) sep.classList.add("is-edge");
    });
  };

  update();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
  let raf;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  });
}
