/**
 * Site-wide behaviour: command palette, copy-to-clipboard, the live clock and
 * the cursor-tracked card light and tilt.
 *
 * Module scripts run once per full page load, but the ClientRouter swaps the
 * DOM underneath them. So everything is bound with event delegation on
 * `document` and every element is looked up at event time - nothing holds a
 * reference to a node that a navigation may have replaced.
 */
import { EMAIL, TIMEZONE, TIMEZONE_LABEL } from "../consts";

/* ------------------------------------------------------------------------ */
/* Toast                                                                    */
/* ------------------------------------------------------------------------ */
let toastTimer = 0;
function toast(message: string) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-shown");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el?.classList.remove("is-shown"), 2200);
}

async function copy(text: string, message: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch {
    // Clipboard blocked (insecure context, permissions): fall back to mail.
    window.location.href = `mailto:${text}`;
  }
}

/* ------------------------------------------------------------------------ */
/* Theme                                                                    */
/* ------------------------------------------------------------------------ */
function toggleTheme() {
  // The click handler for #theme-toggle lives in the inline head script so it
  // works before this module loads; reuse it rather than duplicating it.
  document.getElementById("theme-toggle")?.click();
}

/* ------------------------------------------------------------------------ */
/* Command palette                                                          */
/* ------------------------------------------------------------------------ */
const dialog = () => document.getElementById("cmdk") as HTMLDialogElement | null;
const input = () => document.getElementById("cmdk-input") as HTMLInputElement | null;

function visibleItems(): HTMLElement[] {
  const d = dialog();
  if (!d) return [];
  return Array.from(d.querySelectorAll<HTMLElement>(".cmdk__item")).filter((el) => !el.hidden);
}

function select(el: HTMLElement | undefined) {
  const d = dialog();
  if (!d) return;
  d.querySelectorAll('.cmdk__item[aria-selected="true"]').forEach((n) => n.removeAttribute("aria-selected"));
  if (!el) return;
  el.setAttribute("aria-selected", "true");
  el.scrollIntoView({ block: "nearest" });
}

function filter(query: string) {
  const d = dialog();
  if (!d) return;
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  d.querySelectorAll<HTMLElement>(".cmdk__item").forEach((el) => {
    const haystack = el.dataset.search ?? "";
    el.hidden = !terms.every((t) => haystack.includes(t));
  });
  d.querySelectorAll<HTMLElement>(".cmdk__group").forEach((group) => {
    group.hidden = !group.querySelector(".cmdk__item:not([hidden])");
  });
  const items = visibleItems();
  const empty = d.querySelector<HTMLElement>(".cmdk__empty");
  if (empty) empty.hidden = items.length > 0;
  select(items[0]);
}

function openPalette() {
  const d = dialog();
  if (!d || d.open) return;
  d.showModal();
  const i = input();
  if (i) {
    i.value = "";
    filter("");
    i.focus();
  }
}

function closePalette() {
  dialog()?.close();
}

function runAction(action: string | undefined) {
  closePalette();
  if (action === "copy-email") copy(EMAIL, "Email copied to clipboard");
  if (action === "toggle-theme") toggleTheme();
}

document.addEventListener("keydown", (event) => {
  const d = dialog();
  const typing =
    event.target instanceof HTMLElement &&
    (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName));

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    d?.open ? closePalette() : openPalette();
    return;
  }
  if (event.key === "/" && !typing && !d?.open) {
    event.preventDefault();
    openPalette();
    return;
  }
  if (!d?.open) return;

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const items = visibleItems();
    if (!items.length) return;
    const current = items.findIndex((el) => el.getAttribute("aria-selected") === "true");
    const step = event.key === "ArrowDown" ? 1 : -1;
    select(items[(current + step + items.length) % items.length]);
  } else if (event.key === "Enter") {
    const active = d.querySelector<HTMLElement>('.cmdk__item[aria-selected="true"]');
    if (!active) return;
    event.preventDefault();
    active.click();
  }
});

document.addEventListener("input", (event) => {
  if ((event.target as HTMLElement)?.id === "cmdk-input") {
    filter((event.target as HTMLInputElement).value);
  }
});

document.addEventListener("pointermove", (event) => {
  const item = (event.target as Element)?.closest?.(".cmdk__item") as HTMLElement | null;
  if (item && item.getAttribute("aria-selected") !== "true") select(item);
});

document.addEventListener("click", (event) => {
  const target = event.target as Element | null;
  if (!target?.closest) return;

  if (target.closest("[data-cmdk-open]")) {
    openPalette();
    return;
  }

  const d = dialog();
  // A click on the backdrop lands on the <dialog> itself, outside the panel.
  if (d?.open && target === d) {
    closePalette();
    return;
  }

  const action = target.closest<HTMLElement>(".cmdk__item[data-action]");
  if (action) {
    runAction(action.dataset.action);
    return;
  }
  if (target.closest(".cmdk__item")) {
    // Links navigate on their own; just get the modal out of the way.
    closePalette();
    return;
  }

  const copyTrigger = target.closest<HTMLElement>("[data-copy]");
  if (copyTrigger?.dataset.copy) {
    copy(copyTrigger.dataset.copy, "Email copied to clipboard");
  }
});

/* ------------------------------------------------------------------------ */
/* Live clock                                                               */
/* ------------------------------------------------------------------------ */
const clockFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function tick() {
  const now = clockFormat.format(new Date());
  document.querySelectorAll<HTMLElement>("[data-clock]").forEach((el) => {
    el.textContent = el.dataset.clock === "short" ? now : `${now} ${TIMEZONE_LABEL}`;
  });
}

/* ------------------------------------------------------------------------ */
/* Card light and tilt                                                      */
/* ------------------------------------------------------------------------ */
// `.spotlight` cards get --mx/--my (the cursor, for the glare and the border
// light); `.tilt` cards also get --rx/--ry, a few degrees of 3D lean toward
// the cursor. The card under the pointer is tracked so the one it just left
// can settle back flat.
const TILT_DEG = 5;
let pending: PointerEvent | null = null;
let frame = 0;
let active: HTMLElement | null = null;

function settle(el: HTMLElement | null) {
  if (!el) return;
  el.style.setProperty("--rx", "0deg");
  el.style.setProperty("--ry", "0deg");
}

document.addEventListener(
  "pointermove",
  (event) => {
    if (event.pointerType !== "mouse") return;
    pending = event;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const e = pending;
      pending = null;
      const el = (e?.target as Element | null)?.closest?.(".spotlight") as HTMLElement | null;
      if (el !== active) {
        settle(active);
        active = el;
      }
      if (!e || !el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      if (el.classList.contains("tilt")) {
        el.style.setProperty("--ry", `${((x / rect.width) * 2 - 1) * TILT_DEG}deg`);
        el.style.setProperty("--rx", `${-((y / rect.height) * 2 - 1) * TILT_DEG}deg`);
      }
    });
  },
  { passive: true },
);
document.addEventListener("pointerleave", () => {
  settle(active);
  active = null;
});

/* ------------------------------------------------------------------------ */
/* Button text roll                                                         */
/* ------------------------------------------------------------------------ */
// Wraps the first text in each .btn as <span.roll><span>Label</span>
// <span aria-hidden>Label</span></span>; CSS slides the pair up on hover.
function rollButtons() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll<HTMLElement>(".btn:not([data-roll])").forEach((btn) => {
    btn.dataset.roll = "";
    const text = Array.from(btn.childNodes).find(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
    );
    const span = text ? null : btn.querySelector<HTMLElement>(":scope > span:not([class])");
    const label = (text?.textContent ?? span?.textContent ?? "").trim();
    if (!label) return;
    const roll = document.createElement("span");
    roll.className = "roll";
    const a = document.createElement("span");
    a.textContent = label;
    const b = document.createElement("span");
    b.textContent = label;
    b.setAttribute("aria-hidden", "true");
    roll.append(a, b);
    (text ?? span)!.replaceWith(roll);
  });
}

/* ------------------------------------------------------------------------ */
/* Per-page setup                                                           */
/* ------------------------------------------------------------------------ */
function onPage() {
  tick();
  rollButtons();
  // Show the right modifier key on the search button.
  const mac = /Mac|iPhone|iPad/.test(navigator.userAgent);
  document.querySelectorAll<HTMLElement>("[data-mod-key]").forEach((el) => {
    el.textContent = mac ? "⌘K" : "Ctrl K";
  });
}

window.setInterval(tick, 15_000);
document.addEventListener("astro:page-load", onPage);
onPage();
