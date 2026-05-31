// Shared Tailwind utility-class strings (no custom CSS — just composed utilities).
// "Botanical Apothecary Ledger" — light cream paper, forest-green ink, sand lines.

// --- layout ---
export const page = "max-w-[640px] mx-auto px-[18px] py-[22px] animate-rise";
export const pageHeader = "flex items-center justify-between mb-5 gap-3";
export const pageTitle = "font-display text-[30px] font-semibold tracking-[-.4px] text-primary-dim";
export const sectionTitle = "font-mono text-[11px] font-bold mb-3 text-faint uppercase tracking-[.6px]";

// --- buttons ---
const btnBase =
  "inline-flex items-center justify-center gap-[7px] rounded-md font-body font-bold tracking-[.1px] border border-transparent transition active:translate-y-px active:scale-[.99] disabled:opacity-50 disabled:pointer-events-none";
export const sizeMd = "px-5 py-[11px] text-[14.5px]";
export const sizeSm = "px-3.5 py-2 text-[12.5px]";

const vPrimary =
  "bg-gradient-to-b from-primary-bright to-primary text-bg shadow-[0_1px_0_rgba(255,255,255,.18)_inset,0_6px_16px_-8px_rgba(13,83,14,.5)] hover:shadow-[0_1px_0_rgba(255,255,255,.18)_inset,0_8px_22px_-8px_rgba(13,83,14,.6)] hover:brightness-[1.04]";
const vFill =
  "bg-gradient-to-b from-primary-bright to-primary text-bg shadow-[0_1px_0_rgba(255,255,255,.18)_inset,0_6px_18px_-8px_rgba(13,83,14,.45)]";
const vTake =
  "bg-gradient-to-b from-take-bright to-take text-bg shadow-[0_1px_0_rgba(255,255,255,.18)_inset,0_6px_18px_-8px_rgba(176,83,46,.45)]";
const vGhost =
  "!border-line bg-surface text-muted font-semibold hover:text-primary-dim hover:!border-primary hover:bg-surface2";
const vDanger = "!border-take/35 bg-take/8 text-take hover:bg-take/15";

export const btnPrimary = `${btnBase} ${sizeMd} ${vPrimary}`;
export const btnPrimarySm = `${btnBase} ${sizeSm} ${vPrimary}`;
export const btnPrimaryFull = `${btnBase} ${sizeMd} w-full ${vPrimary}`;
export const btnFillFull = `${btnBase} ${sizeMd} w-full ${vFill}`;
export const btnTakeFull = `${btnBase} ${sizeMd} w-full ${vTake}`;
export const btnGhost = `${btnBase} ${sizeMd} ${vGhost}`;
export const btnGhostSm = `${btnBase} ${sizeSm} ${vGhost}`;
export const btnDangerSm = `${btnBase} ${sizeSm} ${vDanger}`;

// --- fields ---
export const field = "flex flex-col gap-[7px]";
export const fieldLabel = "font-mono text-[11px] font-bold tracking-[.4px] uppercase text-muted";
export const fieldInput =
  "w-full px-3.5 py-3 border border-line rounded-md text-[15px] font-body text-ink bg-bg2 outline-none transition appearance-none placeholder:text-faint focus:border-primary focus:bg-surface focus:shadow-[0_0_0_3px_rgba(48,109,41,.14)]";

// --- form card ---
export const formCard =
  "relative bg-surface rounded-[10px] p-[22px] flex flex-col gap-[17px] border border-line border-t-[3px] border-t-primary shadow-[0_10px_30px_-14px_rgba(13,83,14,.28)] animate-rise";
export const formSubtitle = "font-display text-[20px] font-semibold tracking-[-.2px] text-primary-dim";
export const formActions = "flex gap-2.5 justify-end pt-1";

// --- alerts ---
const alertBase =
  "px-3.5 py-3 rounded-md text-[13.5px] font-semibold flex items-center gap-2 animate-rise before:content-[''] before:w-[3px] before:self-stretch before:rounded";
export const alertError = `${alertBase} bg-take/10 text-take border border-take/30 before:bg-take`;
export const alertSuccess = `${alertBase} bg-primary/10 text-primary-dim border border-primary/30 before:bg-primary`;

// --- badges ---
const badgeBase =
  "inline-flex items-center px-2.5 py-[3px] rounded-[5px] font-mono text-[10.5px] font-bold tracking-[.3px] border";
export const badge = `${badgeBase} bg-primary/10 text-primary-dim border-primary/25`;
export const badgeAdmin = `${badgeBase} bg-gold/12 text-gold border-gold/35`;

// --- states ---
export const loading = "py-10 text-center text-muted font-mono text-[13px] tracking-[.5px]";
