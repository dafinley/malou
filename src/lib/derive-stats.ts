import type { ControlKey, MethodKey, ToggleKey } from "@/src/data/training";
import { formatCompact } from "@/src/lib/format";

export type Values = Record<ControlKey, number>;
export type Toggles = Record<ToggleKey, boolean>;

export type Segment = {
  label: string;
  value: number;
  color: string;
};

export type DerivedStats = {
  modelParams: number;
  hiddenSize: number;
  layers: number;
  trainableParams: number;
  trainableShare: number;
  memoryBytes: number;
  fullMemoryBytes: number;
  memoryRatio: number;
  tokensPerStep: number;
  headline: string;
  bottleneck: string;
  signal: string;
  stack: Segment[];
};

const colorFor = {
  weights: "var(--cyan)",
  gradients: "var(--red)",
  optimizer: "var(--amber)",
  activations: "var(--violet)",
  adapters: "var(--green)",
  frozen: "var(--line-strong)",
  reward: "var(--pink)",
  scales: "var(--pink)"
};

export function layersForParams(params: number): number {
  if (params <= 1.5e9) return 24;
  if (params <= 8e9) return 32;
  if (params <= 15e9) return 40;
  if (params <= 35e9) return 60;
  return 80;
}

export function hiddenForParams(params: number, layers: number): number {
  return Math.round(Math.sqrt(params / (12 * layers)) / 64) * 64;
}

export function adapterParams(params: number, rank: number): number {
  const layers = layersForParams(params);
  const hidden = hiddenForParams(params, layers);
  const projectedMatrices = 4;
  return layers * projectedMatrices * 2 * hidden * rank;
}

// Block-quant scale overhead in bytes for a quantized weight tensor of `params`.
// Plain: each block carries an FP32 scale (4 bytes).
// Double-quant: first-level scales are 8-bit (1 byte) plus a tiny FP32 second-level
// scale per 256 first-level scales. Matches the QLoRA paper.
export function blockScaleBytes(params: number, blockSize: number, doubleQuant: boolean): number {
  const blocks = Math.ceil(params / blockSize);
  if (doubleQuant) {
    return blocks * 1 + Math.ceil(blocks / 256) * 4;
  }
  return blocks * 4;
}

export function deriveStats(methodKey: MethodKey, values: Values, toggles: Toggles): DerivedStats {
  const modelParams = values.modelSizeB * 1e9;
  const layers = layersForParams(modelParams);
  const hiddenSize = hiddenForParams(modelParams, layers);
  const tokensPerStep = values.sequenceLength * values.batchSize;
  const activationBytes = tokensPerStep * hiddenSize * layers * 2.2;
  const fullWeightBytes = modelParams * 2;
  const fullGradientBytes = modelParams * 2;
  const fullOptimizerBytes = modelParams * 8;
  const fullMemoryBytes =
    fullWeightBytes + fullGradientBytes + fullOptimizerBytes + activationBytes;

  if (methodKey === "full-training") {
    return {
      modelParams,
      hiddenSize,
      layers,
      trainableParams: modelParams,
      trainableShare: 100,
      memoryBytes: fullMemoryBytes,
      fullMemoryBytes,
      memoryRatio: 1,
      tokensPerStep,
      headline: `${formatCompact(values.datasetTokensB * 1e9)} tokens shape every layer`,
      bottleneck: "Data quality, optimizer stability, and total compute dominate.",
      signal: "Dense supervised signal from every next-token prediction.",
      stack: [
        { label: "weights", value: fullWeightBytes, color: colorFor.weights },
        { label: "gradients", value: fullGradientBytes, color: colorFor.gradients },
        { label: "optimizer", value: fullOptimizerBytes, color: colorFor.optimizer },
        { label: "activations", value: activationBytes, color: colorFor.activations }
      ]
    };
  }

  if (methodKey === "adapter-finetuning") {
    const adapter = adapterParams(modelParams, values.rank);
    const adapterBytes = adapter * 2;
    const adapterOptimizerBytes = adapter * 8;
    const memoryBytes = fullWeightBytes + adapterBytes + adapterOptimizerBytes + activationBytes;

    return {
      modelParams,
      hiddenSize,
      layers,
      trainableParams: adapter,
      trainableShare: (adapter / modelParams) * 100,
      memoryBytes,
      fullMemoryBytes,
      memoryRatio: memoryBytes / fullMemoryBytes,
      tokensPerStep,
      headline: `${formatCompact(adapter)} adapter params move`,
      bottleneck: "Rank controls capacity; sequence length controls activation pressure.",
      signal: "Supervised examples steer a frozen base through small update matrices.",
      stack: [
        { label: "frozen base", value: fullWeightBytes, color: colorFor.frozen },
        { label: "adapters", value: adapterBytes, color: colorFor.adapters },
        { label: "adapter optimizer", value: adapterOptimizerBytes, color: colorFor.optimizer },
        { label: "activations", value: activationBytes, color: colorFor.activations }
      ]
    };
  }

  if (methodKey === "qlora") {
    const adapter = adapterParams(modelParams, values.rank);
    const isQuantized = values.quantBits < 16;
    const quantizedBaseBytes = (modelParams * values.quantBits) / 8;
    const scaleBytes = isQuantized
      ? blockScaleBytes(modelParams, values.blockSize, toggles.doubleQuant)
      : 0;
    const adapterBytes = adapter * 2;
    const adapterOptimizerBytes = adapter * 10;
    const memoryBytes =
      quantizedBaseBytes + scaleBytes + adapterBytes + adapterOptimizerBytes + activationBytes;

    return {
      modelParams,
      hiddenSize,
      layers,
      trainableParams: adapter,
      trainableShare: (adapter / modelParams) * 100,
      memoryBytes,
      fullMemoryBytes,
      memoryRatio: memoryBytes / fullMemoryBytes,
      tokensPerStep,
      headline: `${values.quantBits}-bit base, ${formatCompact(adapter)} trainable`,
      bottleneck: "Quantized storage saves VRAM; kernels and activation memory still matter.",
      signal: "Same supervised objective as LoRA, with a compressed frozen checkpoint.",
      stack: [
        { label: "quantized base", value: quantizedBaseBytes, color: colorFor.frozen },
        ...(scaleBytes > 0
          ? [
              {
                label: toggles.doubleQuant ? "quant scales (dq)" : "quant scales (fp32)",
                value: scaleBytes,
                color: colorFor.scales
              }
            ]
          : []),
        { label: "adapters", value: adapterBytes, color: colorFor.adapters },
        { label: "adapter optimizer", value: adapterOptimizerBytes, color: colorFor.optimizer },
        { label: "activations", value: activationBytes, color: colorFor.activations }
      ]
    };
  }

  if (methodKey === "distillation") {
    const teacherParams = values.teacherSizeB * 1e9;
    const studentParams = values.studentSizeB * 1e9;
    const studentLayers = layersForParams(studentParams);
    const studentHidden = hiddenForParams(studentParams, studentLayers);
    const studentActivationBytes =
      values.sequenceLength * values.batchSize * studentHidden * studentLayers * 2.2;
    const teacherBytes = teacherParams * 2;
    const studentBytes = studentParams * 12 + studentActivationBytes;
    const compression = Math.max(teacherParams / studentParams, 1);

    return {
      modelParams: studentParams,
      hiddenSize: studentHidden,
      layers: studentLayers,
      trainableParams: studentParams,
      trainableShare: 100,
      memoryBytes: teacherBytes + studentBytes,
      fullMemoryBytes: teacherParams * 12 + studentActivationBytes,
      memoryRatio: (teacherBytes + studentBytes) / (teacherParams * 12 + studentActivationBytes),
      tokensPerStep,
      headline: `${compression.toFixed(1)}x compression target`,
      bottleneck: "The teacher adds training cost once; the student pays back at inference.",
      signal: `${Math.round(values.softTargetWeight * 100)}% soft teacher targets at T=${values.temperature.toFixed(1)}.`,
      stack: [
        { label: "teacher forward", value: teacherBytes, color: colorFor.frozen },
        { label: "student weights", value: studentParams * 2, color: colorFor.weights },
        { label: "student optimizer", value: studentParams * 8, color: colorFor.optimizer },
        { label: "activations", value: studentActivationBytes, color: colorFor.activations }
      ]
    };
  }

  const policyParams = modelParams;
  const policyAdapter = adapterParams(policyParams, Math.max(values.rank, 16));
  const policyBytes = policyParams * 2;
  const referenceBytes = policyParams * 2;
  const rewardBytes = policyParams * 0.45;
  const trainableBytes = policyAdapter * 10;
  const rolloutBytes = values.rollouts * values.sequenceLength * hiddenSize * 2;
  const memoryBytes = policyBytes + referenceBytes + rewardBytes + trainableBytes + rolloutBytes;

  return {
    modelParams,
    hiddenSize,
    layers,
    trainableParams: policyAdapter,
    trainableShare: (policyAdapter / policyParams) * 100,
    memoryBytes,
    fullMemoryBytes,
    memoryRatio: memoryBytes / fullMemoryBytes,
    tokensPerStep: values.rollouts * values.sequenceLength,
    headline: `${values.rollouts} rollouts scored per prompt batch`,
    bottleneck: "Reward quality and drift control matter more than raw parameter count.",
    signal: `${Math.round(values.rewardSignal)}% reward reliability in this scenario.`,
    stack: [
      { label: "policy", value: policyBytes, color: colorFor.weights },
      { label: "reference", value: referenceBytes, color: colorFor.frozen },
      { label: "reward source", value: rewardBytes, color: colorFor.reward },
      { label: "policy update", value: trainableBytes, color: colorFor.adapters },
      { label: "rollouts", value: rolloutBytes, color: colorFor.activations }
    ]
  };
}
