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
  masterWeights: "var(--pink)",
  adapters: "var(--green)",
  frozen: "var(--line-strong)",
  reward: "var(--pink)",
  scales: "var(--pink)"
};

export const bf16Bytes = 2;
export const adamMomentBytes = 8;

export const fullTrainingState = [
  { label: "weights", bytesPerParam: bf16Bytes, color: colorFor.weights, note: "bf16" },
  { label: "gradients", bytesPerParam: bf16Bytes, color: colorFor.gradients, note: "bf16" },
  {
    label: "Adam m + v",
    bytesPerParam: adamMomentBytes,
    color: colorFor.optimizer,
    note: "fp32 state"
  },
  { label: "fp32 master", bytesPerParam: 4, color: colorFor.masterWeights, note: "master weights" }
];

export const fullTrainingBytesPerParam = fullTrainingState.reduce(
  (bytes, segment) => bytes + segment.bytesPerParam,
  0
);

function trainingStack(params: number, activationBytes: number): Segment[] {
  return [
    ...fullTrainingState.map(({ label, bytesPerParam, color }) => ({
      label,
      value: params * bytesPerParam,
      color
    })),
    { label: "activations", value: activationBytes, color: colorFor.activations }
  ];
}

function stackBytes(stack: Segment[]): number {
  return stack.reduce((total, segment) => total + segment.value, 0);
}

function estimateActivationBytes(tokens: number, hidden: number, layers: number) {
  return tokens * hidden * layers * 2.2;
}

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
  const activationBytes = estimateActivationBytes(tokensPerStep, hiddenSize, layers);
  const fullMemoryBytes = modelParams * fullTrainingBytesPerParam + activationBytes;

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
      stack: trainingStack(modelParams, activationBytes)
    };
  }

  if (methodKey === "adapter-finetuning" || methodKey === "qlora") {
    const isQLoRA = methodKey === "qlora";
    const adapter = adapterParams(modelParams, values.rank);
    const bits = isQLoRA ? values.quantBits : 16;
    const isQuantized = bits < 16;
    const scaleBytes = isQuantized
      ? blockScaleBytes(modelParams, values.blockSize, toggles.doubleQuant)
      : 0;
    const stack = [
      {
        label: isQuantized ? "quantized base" : "frozen base (bf16)",
        value: (modelParams * bits) / 8,
        color: colorFor.frozen
      },
      ...(scaleBytes > 0
        ? [
            {
              label: toggles.doubleQuant ? "quant scales (dq)" : "quant scales (fp32)",
              value: scaleBytes,
              color: colorFor.scales
            }
          ]
        : []),
      { label: "adapters", value: adapter * bf16Bytes, color: colorFor.adapters },
      { label: "adapter gradients", value: adapter * bf16Bytes, color: colorFor.gradients },
      { label: "adapter optimizer", value: adapter * adamMomentBytes, color: colorFor.optimizer },
      { label: "activations", value: activationBytes, color: colorFor.activations }
    ];
    const memoryBytes = stackBytes(stack);

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
      headline: isQLoRA
        ? `${bits}-bit base, ${formatCompact(adapter)} trainable`
        : `${formatCompact(adapter)} adapter params move`,
      bottleneck: isQuantized
        ? "Quantized storage saves VRAM; kernels and activation memory still matter."
        : "Rank controls capacity; sequence length controls activation pressure.",
      signal: isQuantized
        ? "Same supervised objective as LoRA, with a compressed frozen checkpoint."
        : "Supervised examples steer a frozen base through small update matrices.",
      stack
    };
  }

  if (methodKey === "distillation") {
    const teacherParams = values.teacherSizeB * 1e9;
    const studentParams = values.studentSizeB * 1e9;
    const studentLayers = layersForParams(studentParams);
    const studentHidden = hiddenForParams(studentParams, studentLayers);
    const studentActivations = estimateActivationBytes(tokensPerStep, studentHidden, studentLayers);
    const teacherLayers = layersForParams(teacherParams);
    const teacherHidden = hiddenForParams(teacherParams, teacherLayers);
    const teacherBaseline =
      teacherParams * fullTrainingBytesPerParam +
      estimateActivationBytes(tokensPerStep, teacherHidden, teacherLayers);
    const useTeacher = values.softTargetWeight > 0;
    const compression = Math.max(teacherParams / studentParams, 1);
    const stack = trainingStack(studentParams, studentActivations);
    if (useTeacher) {
      stack.unshift({
        label: "teacher weights",
        value: teacherParams * bf16Bytes,
        color: colorFor.frozen
      });
    }
    const memoryBytes = stackBytes(stack);

    return {
      modelParams: studentParams,
      hiddenSize: studentHidden,
      layers: studentLayers,
      trainableParams: studentParams,
      trainableShare: 100,
      memoryBytes,
      fullMemoryBytes: teacherBaseline,
      memoryRatio: memoryBytes / teacherBaseline,
      tokensPerStep,
      headline: useTeacher ? `${compression.toFixed(1)}x compression target` : "Student only",
      bottleneck: "The student pays back its training cost with cheaper inference.",
      signal: useTeacher
        ? `${Math.round(values.softTargetWeight * 100)}% soft teacher targets at T=${values.temperature.toFixed(1)}.`
        : "Supervised training on the student with hard labels.",
      stack
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
