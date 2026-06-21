export function playRestTimerDoneSound(): void {
  if (typeof window === "undefined") return;
  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;

  const ctx = new Ctx();
  const t0 = ctx.currentTime;

  const hits = [
    { freq: 148, duration: 0.28, gapAfter: 0.12, gain: 0.68 },
    { freq: 148, duration: 0.28, gapAfter: 0.12, gain: 0.76 },
    { freq: 185, duration: 0.78, gapAfter: 0, gain: 0.9 },
  ] as const;

  let cursor = t0;
  for (const hit of hits) {
    const start = cursor;
    const end = start + hit.duration;

    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const gain = ctx.createGain();
    const subGain = ctx.createGain();
    const shaper = ctx.createWaveShaper();

    shaper.curve = makeDistortionCurve(180);
    shaper.oversample = "4x";

    osc.type = "square";
    osc.frequency.value = hit.freq;
    sub.type = "sawtooth";
    sub.frequency.value = hit.freq * 0.5;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(hit.gain, start + 0.008);
    gain.gain.setValueAtTime(hit.gain * 0.85, start + hit.duration * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    subGain.gain.setValueAtTime(0.0001, start);
    subGain.gain.linearRampToValueAtTime(hit.gain * 0.45, start + 0.01);
    subGain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    sub.connect(subGain);
    gain.connect(shaper);
    subGain.connect(shaper);
    shaper.connect(ctx.destination);

    osc.start(start);
    sub.start(start);
    osc.stop(end + 0.01);
    sub.stop(end + 0.01);

    cursor = end + hit.gapAfter;
  }

  window.setTimeout(() => void ctx.close(), 3600);
}

export function playRestTimerStopSound(): void {
  if (typeof window === "undefined") return;
  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;

  const ctx = new Ctx();
  const t0 = ctx.currentTime;
  const duration = 0.11;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(320, t0);
  osc.frequency.exponentialRampToValueAtTime(90, t0 + duration);

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(0.38, t0 + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.01);

  window.setTimeout(() => void ctx.close(), 400);
}

function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 256;
  const curve = new Float32Array(n);
  const deg = Math.PI / 180;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve as Float32Array<ArrayBuffer>;
}
