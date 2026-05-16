export function softmaxT(logits: number[], T: number): number[] {
  const scaled = logits.map((l) => l / T);
  const m = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - m));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export function kl(p: number[], q: number[]): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    if (p[i] > 1e-9 && q[i] > 1e-9) s += p[i] * Math.log(p[i] / q[i]);
  }
  return s;
}

export function entropy(p: number[]): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) if (p[i] > 1e-9) s -= p[i] * Math.log(p[i]);
  return s;
}

// Fixed logits for the temperature viz — a "cat" image where the teacher is
// confident it's a cat, with kinda-dog / kinda-tiger neighbors carrying the
// "dark knowledge" the student learns from.
export const EXAMPLE_LOGITS = [4.2, 2.1, 1.9, -0.8, -1.0, -1.2, -1.4, -1.6, -1.8, -2.0];

export const EXAMPLE_LABELS = [
  "cat",
  "dog",
  "tiger",
  "car",
  "truck",
  "plane",
  "ship",
  "frog",
  "bird",
  "fish"
];
