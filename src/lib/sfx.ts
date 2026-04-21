/** Efeitos sonoros leves para demonstração (Web Audio), sem ficheiros externos. */

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  return new Ctx();
}

export function playEnergyCharge(): void {
  const ctx = getCtx();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(120, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35);
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.46);
}

export function playMetallicBeep(): void {
  const ctx = getCtx();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(1760, ctx.currentTime);
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.13);
}

export function playAlertFail(): void {
  const ctx = getCtx();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(220, ctx.currentTime);
  o.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.4);
  g.gain.setValueAtTime(0.08, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.42);
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.43);
}

export function playSuccessChime(): void {
  const ctx = getCtx();
  if (!ctx) return;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    const t = ctx.currentTime + i * 0.06;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.36);
  });
}
