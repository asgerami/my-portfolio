/**
 * Interactive figures for blog posts.
 *
 * A post marks a static image with a title of "viz:<name>":
 *
 *   ![alt text](../../assets/.../power.webp "viz:solar")
 *
 * and this script swaps it for a live figure on page load. The static image
 * stays in the HTML for RSS readers, the Markdown twin and anyone without
 * JavaScript, so the figure degrades to exactly what the post showed before.
 *
 * Every number scales linearly from the figures the "Data centers in space"
 * post states for a 100 MW site, so the live figure and the text can never
 * disagree: at 100 MW they read the same.
 */

/** The post's own numbers for a 100 MW data center. */
const AT_100MW = {
  solarM2: 300_000,
  issArraySets: 120, // ISS arrays are ~2,500 m² each
  footballFieldsSolar: 40,
  solarMassKg: [830_000, 1_000_000] as const,
  radiatorsIssStyleM2: 1_200_000,
  issRadiatorSets: 1_400,
  radiatorsStarcloudM2: 160_000,
  footballFieldsStarcloud: 22,
};
const ISS_ARRAYS_M2 = 2_500;
const STARSHIP_PAYLOAD_KG = 100_000;

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const mwLabel = (mw: number) => (mw >= 1000 ? `${mw / 1000} GW` : `${mw} MW`);
const scale = (mw: number) => mw / 100;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** One shared tooltip per figure, positioned inside it. */
function tooltip(host: HTMLElement) {
  const tip = el("div", "viz__tip");
  tip.setAttribute("role", "status");
  host.append(tip);
  return {
    show(target: Element, html: string) {
      tip.innerHTML = html;
      const h = host.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      const half = tip.offsetWidth / 2 + 8;
      tip.style.left = `${Math.min(Math.max(t.left + t.width / 2 - h.left, half), h.width - half)}px`;
      tip.style.top = `${t.top - h.top}px`;
      tip.classList.add("is-shown");
    },
    hide() {
      tip.classList.remove("is-shown");
    },
  };
}

function stat(label: string) {
  const wrap = el("div", "viz__stat");
  const value = el("dd", "viz__stat-value");
  wrap.append(el("dt", "viz__stat-label", label), value);
  return { wrap, value };
}

/* ------------------------------------------------------------------ */
/* Power: how many ISS-sized solar arrays a data center needs          */
/* ------------------------------------------------------------------ */
const SIZES_MW = [10, 25, 50, 100, 250, 500, 1000];

function solar(): HTMLElement {
  const fig = el("figure", "viz viz--solar");
  fig.append(el("p", "viz__eyebrow", "Power · try it"), el("p", "viz__title", "How much solar does it take?"));

  const control = el("label", "viz__control");
  const name = el("span", "viz__control-name", "Data center size");
  const output = el("output", "viz__control-value");
  const range = el("input", "viz__range");
  range.type = "range";
  range.min = "0";
  range.max = String(SIZES_MW.length - 1);
  range.step = "1";
  range.value = String(SIZES_MW.indexOf(100));
  control.append(name, output, range);

  const stats = el("dl", "viz__stats");
  const area = stat("Solar panels");
  const arrays = stat("ISS-sized arrays");
  const fields = stat("Football fields");
  const mass = stat("Panel weight");
  const trips = stat("Starship trips");
  stats.append(area.wrap, arrays.wrap, fields.wrap, mass.wrap, trips.wrap);
  stats.setAttribute("aria-live", "polite");

  const grid = el("div", "viz__tiles");
  grid.setAttribute("aria-hidden", "true");
  const note = el(
    "figcaption",
    "viz__note",
    "Each square is one ISS solar array set (~2,500 m²). Scaled from the 100 MW figures in this post: ~340 W/m² from 1,361 W/m² sunlight at ~25% efficiency, 830,000–1,000,000 kg of panels per 300,000 m², 100,000 kg per Starship.",
  );
  fig.append(control, stats, grid, note);
  const tip = tooltip(fig);

  let drawn = 0;
  function render() {
    const mw = SIZES_MW[Number(range.value)];
    const k = scale(mw);
    const count = Math.round(AT_100MW.issArraySets * k);
    const [lo, hi] = AT_100MW.solarMassKg.map((m) => m * k);
    // Rounded the way the post rounds (830,000 kg / 100,000 kg -> "8")
    const tripsLo = Math.max(1, Math.round(lo / STARSHIP_PAYLOAD_KG));
    const tripsHi = Math.max(1, Math.round(hi / STARSHIP_PAYLOAD_KG));

    output.textContent = mwLabel(mw);
    range.setAttribute("aria-valuetext", mwLabel(mw));
    area.value.textContent = `${fmt(AT_100MW.solarM2 * k)} m²`;
    arrays.value.textContent = fmt(count);
    fields.value.textContent = `~${fmt(AT_100MW.footballFieldsSolar * k)}`;
    mass.value.textContent = `${fmt(lo / 1000)}–${fmt(hi / 1000)} t`;
    trips.value.textContent = tripsLo === tripsHi ? fmt(tripsLo) : `${fmt(tripsLo)}–${fmt(tripsHi)}`;

    // Size the squares so any count fits a fixed-height field
    const width = grid.clientWidth || 600;
    const height = 220;
    const size = Math.max(4, Math.min(28, Math.floor(Math.sqrt((width * height) / count)) - 2));
    grid.style.setProperty("--tile", `${size}px`);
    grid.style.setProperty("--gap", `${size > 10 ? 3 : 1}px`);

    if (count > drawn) {
      const fragment = document.createDocumentFragment();
      for (let i = drawn; i < count; i++) {
        const tile = el("span", "viz__tile");
        tile.dataset.n = String(i + 1);
        tile.style.setProperty("--delay", `${Math.min(i - drawn, 200) * 2}ms`);
        fragment.append(tile);
      }
      grid.append(fragment);
    } else {
      while (grid.childElementCount > count) grid.lastElementChild!.remove();
    }
    drawn = count;
    grid.dataset.total = String(count);
  }

  range.addEventListener("input", render);
  grid.addEventListener("pointerover", (e) => {
    const tile = (e.target as Element).closest<HTMLElement>(".viz__tile");
    if (!tile) return;
    tip.show(
      tile,
      `<strong>Array ${tile.dataset.n} of ${grid.dataset.total}</strong><span>~${fmt(ISS_ARRAYS_M2)} m², the size of the ISS's whole solar wing set</span>`,
    );
  });
  grid.addEventListener("pointerleave", () => tip.hide());
  new ResizeObserver(render).observe(grid);
  requestAnimationFrame(render);
  return fig;
}

/* ------------------------------------------------------------------ */
/* Cooling: area that has to go up                                    */
/* ------------------------------------------------------------------ */
const AREA_SIZES_MW = [100, 250, 500, 1000];

function area(): HTMLElement {
  const fig = el("figure", "viz viz--area");
  fig.append(
    el("p", "viz__eyebrow", "Cooling · try it"),
    el("p", "viz__title", "Area that has to go up"),
  );

  const chips = el("div", "viz__chips");
  chips.setAttribute("role", "group");
  chips.setAttribute("aria-label", "Data center size");
  const buttons = AREA_SIZES_MW.map((mw) => {
    const b = el("button", "viz__chip", mwLabel(mw));
    b.type = "button";
    b.dataset.mw = String(mw);
    chips.append(b);
    return b;
  });

  const rows = [
    {
      name: "Radiators, ISS-style",
      sub: "ISS-scale radiator tech",
      area: (k: number) => AT_100MW.radiatorsIssStyleM2 * k,
      detail: (k: number) => `~${fmt(AT_100MW.issRadiatorSets * k)} ISS radiator sets`,
    },
    {
      name: "Solar panels",
      sub: "~25% efficient",
      area: (k: number) => AT_100MW.solarM2 * k,
      detail: (k: number) => `~${fmt(AT_100MW.footballFieldsSolar * k)} football fields · ~${fmt(AT_100MW.issArraySets * k)} ISS arrays`,
    },
    {
      name: "Radiators, Starcloud's figure",
      sub: "~630 W/m² at 20°C",
      area: (k: number) => AT_100MW.radiatorsStarcloudM2 * k,
      detail: (k: number) => `~${fmt(AT_100MW.footballFieldsStarcloud * k)} football fields`,
    },
    {
      name: "ISS solar arrays today",
      sub: "for scale",
      area: () => ISS_ARRAYS_M2,
      detail: () => "84–120 kW, the largest arrays ever flown",
    },
  ];

  const list = el("div", "viz__bars");
  const parts = rows.map((row) => {
    const wrap = el("div", "viz__bar-row");
    wrap.tabIndex = 0;
    const label = el("p", "viz__bar-name", row.name);
    label.append(el("span", "viz__bar-sub", row.sub));
    const track = el("div", "viz__bar-track");
    const bar = el("span", "viz__bar");
    const value = el("span", "viz__bar-value");
    track.append(bar, value);
    wrap.append(label, track);
    list.append(wrap);
    return { row, wrap, track, bar, value };
  });

  const axis = el("div", "viz__axis");
  axis.setAttribute("aria-hidden", "true");
  const ticks = Array.from({ length: 5 }, () => axis.appendChild(el("span")));
  const note = el(
    "figcaption",
    "viz__note",
    "Scaled from the 100 MW figures in this post. Hover or focus a bar for equivalents.",
  );
  fig.append(chips, list, axis, note);
  const tip = tooltip(fig);

  let mw = 100;
  function render() {
    const k = scale(mw);
    const max = Math.max(...rows.map((r) => r.area(k)));
    for (const { row, wrap, track, value } of parts) {
      const a = row.area(k);
      // On the track, so both the bar and its value label read it
      track.style.setProperty("--w", String(Math.max(a / max, 0.004)));
      value.textContent = `${fmt(a)} m²`;
      wrap.setAttribute("aria-label", `${row.name}: ${fmt(a)} square meters, ${row.detail(k)}`);
    }
    ticks.forEach((t, i) => {
      const v = (max / 4) * i;
      t.textContent = i === 0 ? "0" : v >= 1e6 ? `${(v / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 })}M` : `${fmt(v / 1000)}k`;
    });
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.mw) === mw)));
  }

  chips.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>(".viz__chip");
    if (!b) return;
    mw = Number(b.dataset.mw);
    render();
  });
  const showTip = (wrap: HTMLElement) => {
    const part = parts.find((p) => p.wrap === wrap);
    if (!part) return;
    const k = scale(mw);
    tip.show(part.bar, `<strong>${fmt(part.row.area(k))} m²</strong><span>${part.row.detail(k)}</span>`);
  };
  list.addEventListener("pointerover", (e) => {
    const wrap = (e.target as Element).closest<HTMLElement>(".viz__bar-row");
    if (wrap) showTip(wrap);
  });
  list.addEventListener("pointerleave", () => tip.hide());
  list.addEventListener("focusin", (e) => showTip(e.target as HTMLElement));
  list.addEventListener("focusout", () => tip.hide());
  render();
  return fig;
}

/* ------------------------------------------------------------------ */

const FIGURES: Record<string, () => HTMLElement> = { solar, area };

function enhance() {
  document.querySelectorAll<HTMLImageElement>('.blog-content img[title^="viz:"]').forEach((img) => {
    const build = FIGURES[img.title.slice(4)];
    if (!build) return;
    const figure = build();
    figure.setAttribute("aria-label", img.alt);
    // Markdown wraps a lone image in <p>; replace that wrapper
    const host = img.parentElement?.tagName === "P" && img.parentElement.childElementCount === 1 ? img.parentElement : img;
    host.replaceWith(figure);
  });
}

document.addEventListener("astro:page-load", enhance);
enhance();
