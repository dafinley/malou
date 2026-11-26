import { expect, test } from "bun:test";
import { defaultToggles, defaultValues, methods } from "@/src/data/training";
import { deriveStats, fullTrainingBytesPerParam } from "./derive-stats";

const sharedWorkload = { ...defaultValues, modelSizeB: 7, sequenceLength: 2048, batchSize: 32 };

test("full training includes 16 bytes per parameter and saved activations", () => {
  const { stack, memoryBytes } = deriveStats("full-training", sharedWorkload, defaultToggles);
  const activationBytes = 2048 * 32 * 4288 * 32 * 2.2;

  expect(fullTrainingBytesPerParam).toBe(16);
  expect(memoryBytes).toBe(112e9 + activationBytes);
  expect(stack.find((segment) => segment.label === "activations")?.value).toBe(activationBytes);
});

test("QLoRA and LoRA match when the same base is stored in bf16", () => {
  const bf16 = { ...sharedWorkload, quantBits: 16 };
  const lora = deriveStats("adapter-finetuning", sharedWorkload, defaultToggles);
  const qlora = deriveStats("qlora", bf16, defaultToggles);
  const nf4 = deriveStats("qlora", { ...bf16, quantBits: 4 }, defaultToggles);

  expect(qlora.memoryBytes).toBe(lora.memoryBytes);
  expect(qlora.trainableParams).toBe(lora.trainableParams);
  expect(nf4.memoryBytes).toBeLessThan(lora.memoryBytes);
  expect(nf4.fullMemoryBytes).toBe(lora.fullMemoryBytes);
  expect(nf4.tokensPerStep).toBe(lora.tokensPerStep);
});

test("student-only training allocates no teacher weights", () => {
  const values = { ...sharedWorkload, studentSizeB: 7, teacherSizeB: 70, softTargetWeight: 0 };
  const distill = deriveStats("distillation", values, defaultToggles);
  const full = deriveStats("full-training", values, defaultToggles);

  expect(distill.stack).toEqual(full.stack);
  expect(distill.memoryBytes).toBe(full.memoryBytes);
});

test("each method's stack accounts for the entire memory estimate", () => {
  for (const { key } of methods) {
    const stats = deriveStats(key, sharedWorkload, defaultToggles);
    expect(stats.stack.reduce((total, segment) => total + segment.value, 0)).toBe(
      stats.memoryBytes
    );
  }
});
