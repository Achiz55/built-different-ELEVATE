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
  setupLoops();
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
      announce("Application received. I read every one myself and will reply within 48 hours. Watch your inbox for my reply. If you don't see it in 48 hours, check spam.");
    } catch (err) {
      sending = false;
      if (button) {
        button.disabled = false;
        button.textContent = buttonLabel;
      }
      if (error) {
        error.hidden = false;
        error.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
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

/* -------------------- muted video loops --------------------
   video[data-autoloop] gets its <source data-src> attached and
   played only when motion is welcome (no prefers-reduced-motion,
   no data saver). Otherwise the poster stays as a still image.
   data-lazy videos also wait until they near the viewport, and
   take their poster from data-poster so nothing loads early.
   Loops pause while off screen.                               */
function setupLoops() {
  const videos = [...document.querySelectorAll("video[data-autoloop]")];
  if (!videos.length) return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const motionOk = () => !motionQuery.matches && !saveData;

  const attach = (video) => {
    if (video.dataset.attached) return;
    video.dataset.attached = "1";
    video.querySelectorAll("source[data-src]").forEach((src) => {
      src.src = src.dataset.src;
    });
    video.load();
  };

  const showPoster = (video) => {
    if (video.dataset.poster && !video.getAttribute("poster")) {
      video.setAttribute("poster", video.dataset.poster);
    }
  };

  // Each loop's brass "Pause" chip. A visitor's pause sticks: scrolling
  // back into view won't restart a loop they stopped.
  const toggleFor = (video) => video.parentElement.querySelector(".loop-toggle");
  const setToggle = (video, paused) => {
    const t = toggleFor(video);
    if (!t) return;
    const what = t.getAttribute("aria-label").replace(/^(Pause|Play) /, "");
    t.textContent = paused ? "Play" : "Pause";
    t.setAttribute("aria-label", (paused ? "Play " : "Pause ") + what);
  };

  const start = (video) => {
    showPoster(video);
    if (!motionOk() || video.dataset.userPaused) return;
    attach(video);
    const t = toggleFor(video);
    if (t) t.hidden = false;
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  };

  videos.forEach((video) => {
    const t = toggleFor(video);
    if (!t) return;
    t.addEventListener("click", () => {
      if (video.paused) {
        delete video.dataset.userPaused;
        setToggle(video, false);
        start(video);
      } else {
        video.dataset.userPaused = "1";
        video.pause();
        setToggle(video, true);
      }
    });
  });

  if (!("IntersectionObserver" in window)) {
    videos.forEach(start);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) start(video);
        else if (!video.paused) video.pause();
      });
    },
    { rootMargin: "200px 0px" }
  );

  videos.forEach((video) => {
    if (!video.hasAttribute("data-lazy")) start(video);
    io.observe(video);
  });

  // If the visitor switches on reduced motion, stop and rewind to the poster
  motionQuery.addEventListener?.("change", () => {
    if (!motionQuery.matches) return;
    videos.forEach((video) => {
      const t = toggleFor(video);
      if (t) t.hidden = true;
      video.pause();
      video.removeAttribute("src");
      video.querySelectorAll("source").forEach((src) => src.removeAttribute("src"));
      video.load();
      delete video.dataset.attached;
    });
  });
}
