import type { LucideIcon } from "lucide-react";
import {
  Atom,
  BrainCircuit,
  Cpu,
  Gauge,
  GitBranch,
  GraduationCap,
  Layers3,
  Network,
  Route,
  Sparkles,
  Trophy,
  Workflow
} from "lucide-react";

export type MethodKey =
  | "full-training"
  | "adapter-finetuning"
  | "qlora"
  | "distillation"
  | "reinforcement-learning";

export type ArchitectureKey = "decoder" | "encoder-decoder" | "moe" | "multimodal";

export type ControlKey =
  | "modelSizeB"
  | "datasetTokensB"
  | "sequenceLength"
  | "batchSize"
  | "contextSize"
  | "rank"
  | "alpha"
  | "quantBits"
  | "blockSize"
  | "teacherSizeB"
  | "studentSizeB"
  | "temperature"
  | "softTargetWeight"
  | "rollouts"
  | "rewardSignal"
  | "klBeta";

export type ToggleKey = "doubleQuant" | "compareToFull";

export type SelectorKey = "distillFlavor" | "rlAlgorithm";

export type DistillFlavor = "logits" | "hidden" | "attention" | "all";
export type RlAlgorithm = "ppo" | "dpo" | "grpo" | "rlaif";

export type ControlConfig = {
  key: ControlKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  term?: GlossaryKey;
  format?: "integer" | "decimal" | "oneDecimal" | "percent";
};

export type ToggleConfig = {
  key: ToggleKey;
  label: string;
  hint?: string;
};

export type SelectorOption = { value: string; label: string };

export type SelectorConfig = {
  key: SelectorKey;
  label: string;
  options: SelectorOption[];
  hint?: (value: string) => string;
};

export type GlossaryKey =
  | "activation"
  | "adapter"
  | "attention"
  | "backprop"
  | "batch"
  | "checkpoint"
  | "distillation"
  | "embedding"
  | "fullTraining"
  | "gradient"
  | "inference"
  | "lora"
  | "loss"
  | "optimizerState"
  | "policy"
  | "qlora"
  | "quantization"
  | "rank"
  | "rewardModel"
  | "rlhf"
  | "sequence"
  | "softTargets"
  | "temperature";

export type GlossaryEntry = {
  key: GlossaryKey;
  label: string;
  definition: string;
  intuition: string;
};

export type MethodPreset = {
  name: string;
  description?: string;
  values?: Partial<Record<ControlKey, number>>;
  toggles?: Partial<Record<ToggleKey, boolean>>;
  selectors?: Partial<Record<SelectorKey, string>>;
};

export type Method = {
  key: MethodKey;
  label: string;
  eyebrow: string;
  icon: LucideIcon;
  accent: string;
  summary: string;
  bestFor: string;
  trainable: string;
  frozen: string;
  signal: string;
  risk: string;
  controls: ControlConfig[];
  toggles?: ToggleConfig[];
  selectors?: SelectorConfig[];
  steps: string[];
  vocabulary: GlossaryKey[];
  presets?: MethodPreset[];
};

export type Architecture = {
  key: ArchitectureKey;
  label: string;
  icon: LucideIcon;
  accent: string;
  summary: string;
  trainingNote: string;
  inferenceNote: string;
  blocks: string[];
};

export const defaultValues: Record<ControlKey, number> = {
  modelSizeB: 7,
  datasetTokensB: 80,
  sequenceLength: 2048,
  batchSize: 8,
  contextSize: 8192,
  rank: 16,
  alpha: 32,
  quantBits: 4,
  blockSize: 64,
  teacherSizeB: 70,
  studentSizeB: 7,
  temperature: 4,
  softTargetWeight: 0.7,
  rollouts: 16,
  rewardSignal: 72,
  klBeta: 0.1
};

export const defaultToggles: Record<ToggleKey, boolean> = {
  doubleQuant: true,
  compareToFull: true
};

export const defaultSelectors: Record<SelectorKey, string> = {
  distillFlavor: "logits",
  rlAlgorithm: "ppo"
};

const commonControls: ControlConfig[] = [
  {
    key: "modelSizeB",
    label: "model size",
    min: 0.5,
    max: 70,
    step: 0.5,
    unit: "B params",
    term: "checkpoint",
    format: "oneDecimal"
  },
  {
    key: "sequenceLength",
    label: "sequence length",
    min: 256,
    max: 32768,
    step: 256,
    unit: "tokens",
    term: "sequence",
    format: "integer"
  },
  {
    key: "batchSize",
    label: "batch size",
    min: 1,
    max: 128,
    step: 1,
    unit: "seq/step",
    term: "batch",
    format: "integer"
  }
];

const alphaControl: ControlConfig = {
  key: "alpha",
  label: "LoRA alpha",
  min: 1,
  max: 256,
  step: 1,
  unit: "α",
  term: "lora",
  format: "integer"
};

const rankControl: ControlConfig = {
  key: "rank",
  label: "LoRA rank",
  min: 1,
  max: 128,
  step: 1,
  unit: "r",
  term: "rank",
  format: "integer"
};

const contextControl: ControlConfig = {
  key: "contextSize",
  label: "context size",
  min: 512,
  max: 32768,
  step: 512,
  unit: "tokens",
  term: "sequence",
  format: "integer"
};

export const methods: Method[] = [
  {
    key: "full-training",
    label: "Full Training",
    eyebrow: "all weights move",
    icon: Atom,
    accent: "var(--red)",
    summary:
      "Train every parameter against a broad objective. This is how a base model is born, or how a model is heavily reshaped when adapters are too small a steering wheel.",
    bestFor: "New base models, deep domain models, architecture experiments, tokenizer changes.",
    trainable: "Embeddings, attention, MLPs, norms, heads, and every optimizer slot.",
    frozen: "Nothing, unless you intentionally freeze lower layers.",
    signal: "Usually next-token prediction or supervised loss over a very large corpus.",
    risk: "Maximum cost, maximum data burden, and the easiest path to instability.",
    controls: [
      commonControls[0],
      {
        key: "datasetTokensB",
        label: "training tokens",
        min: 1,
        max: 2000,
        step: 1,
        unit: "B tokens",
        term: "sequence",
        format: "integer"
      },
      commonControls[1],
      commonControls[2]
    ],
    steps: [
      "Sample token batches",
      "Run a full forward pass",
      "Measure language-model loss",
      "Backpropagate through every layer",
      "Update all weights and optimizer state",
      "Evaluate and checkpoint"
    ],
    vocabulary: ["fullTraining", "gradient", "backprop", "optimizerState", "loss", "checkpoint"],
    presets: [
      {
        name: "Chinchilla 7B",
        description: "compute-optimal: ~20 tokens per parameter",
        values: { modelSizeB: 7, datasetTokensB: 140, sequenceLength: 2048, batchSize: 32 }
      },
      {
        name: "Llama 3 8B",
        description: "trained well past Chinchilla optimum (~15T tokens)",
        values: { modelSizeB: 8, datasetTokensB: 1500, sequenceLength: 8192, batchSize: 32 }
      },
      {
        name: "Llama 3 70B",
        description: "frontier pretrain on a massive corpus",
        values: { modelSizeB: 70, datasetTokensB: 1500, sequenceLength: 8192, batchSize: 16 }
      },
      {
        name: "GPT-3 175B",
        description: "the original — undertrained by today's standards",
        values: { modelSizeB: 175, datasetTokensB: 300, sequenceLength: 2048, batchSize: 16 }
      },
      {
        name: "small 1B",
        description: "research-scale sandbox",
        values: { modelSizeB: 1, datasetTokensB: 20, sequenceLength: 2048, batchSize: 64 }
      }
    ]
  },
  {
    key: "adapter-finetuning",
    label: "Fine-tuning / LoRA",
    eyebrow: "small trainable adapters",
    icon: Layers3,
    accent: "var(--cyan)",
    summary:
      "Keep the base model frozen and learn small low-rank update matrices. You get task adaptation without paying to update every original weight.",
    bestFor: "Instruction tuning, domain style, product behavior, fast experiments.",
    trainable: "LoRA A/B matrices, optional bias terms, sometimes the final head.",
    frozen: "Most base-model weights.",
    signal: "Supervised examples: prompts, completions, labels, or preference-selected outputs.",
    risk: "Low rank can underfit; noisy datasets can still teach bad behavior quickly.",
    controls: [
      commonControls[0],
      contextControl,
      commonControls[1],
      commonControls[2],
      rankControl,
      alphaControl
    ],
    steps: [
      "Load a frozen checkpoint",
      "Insert low-rank adapters",
      "Run supervised batches",
      "Backpropagate only through adapters",
      "Merge or serve adapters beside the base",
      "Evaluate task behavior"
    ],
    vocabulary: ["lora", "adapter", "rank", "batch", "sequence", "gradient"],
    presets: [
      {
        name: "tiny",
        description: "small ctx, single sequence, conservative LoRA",
        values: {
          modelSizeB: 7,
          contextSize: 4096,
          sequenceLength: 512,
          batchSize: 1,
          rank: 8,
          alpha: 16
        }
      },
      {
        name: "common",
        description: "standard 8k-context instruction tune",
        values: {
          modelSizeB: 7,
          contextSize: 8192,
          sequenceLength: 2048,
          batchSize: 4,
          rank: 16,
          alpha: 32
        }
      },
      {
        name: "long context",
        description: "32k tokens per sequence — attention pressure dominates",
        values: {
          modelSizeB: 7,
          contextSize: 32768,
          sequenceLength: 16384,
          batchSize: 1,
          rank: 8,
          alpha: 16
        }
      },
      {
        name: "heavy",
        description: "wider rank, larger batch, higher gain",
        values: {
          modelSizeB: 7,
          contextSize: 8192,
          sequenceLength: 4096,
          batchSize: 8,
          rank: 64,
          alpha: 128
        }
      }
    ]
  },
  {
    key: "qlora",
    label: "QLoRA",
    eyebrow: "quantized base, adapter updates",
    icon: Cpu,
    accent: "var(--violet)",
    summary:
      "Store the frozen base model in low-bit precision, dequantize for math, and train LoRA adapters. It turns memory pressure into a controllable tradeoff.",
    bestFor: "Large-model fine-tuning on limited GPU memory.",
    trainable: "LoRA adapters in bf16/fp16 plus optimizer state for those adapters.",
    frozen: "Quantized base weights.",
    signal: "Same supervised data as LoRA; the savings come from storage, not a new objective.",
    risk: "Quantization error, slower kernels, and less headroom for unstable training recipes.",
    controls: [
      commonControls[0],
      {
        key: "quantBits",
        label: "base precision",
        min: 2,
        max: 16,
        step: 1,
        unit: "bits",
        term: "quantization",
        format: "integer"
      },
      {
        key: "blockSize",
        label: "block size",
        min: 32,
        max: 256,
        step: 32,
        unit: "w",
        term: "quantization",
        format: "integer"
      },
      commonControls[1],
      rankControl,
      alphaControl
    ],
    toggles: [
      {
        key: "doubleQuant",
        label: "double quantization",
        hint: "quantize the quantization scales themselves"
      },
      {
        key: "compareToFull",
        label: "compare to full bf16 FT",
        hint: "show side-by-side savings"
      }
    ],
    steps: [
      "Load a low-bit frozen base",
      "Dequantize blocks during matmul",
      "Keep adapter weights in higher precision",
      "Backpropagate through adapters",
      "Page rare optimizer spikes if needed",
      "Ship base plus adapter"
    ],
    vocabulary: ["qlora", "quantization", "lora", "adapter", "optimizerState", "activation"],
    presets: [
      {
        name: "7B default",
        description: "the recipe most people start from",
        values: { modelSizeB: 7, quantBits: 4, blockSize: 64, rank: 16, alpha: 32 },
        toggles: { doubleQuant: true }
      },
      {
        name: "13B common",
        description: "still fits on a single 24 GB GPU",
        values: { modelSizeB: 13, quantBits: 4, blockSize: 64, rank: 16, alpha: 32 },
        toggles: { doubleQuant: true }
      },
      {
        name: "33B",
        description: "needs 48 GB or aggressive offload",
        values: { modelSizeB: 33, quantBits: 4, blockSize: 64, rank: 16, alpha: 32 },
        toggles: { doubleQuant: true }
      },
      {
        name: "65B headline",
        description: "the original QLoRA paper result — single 48 GB GPU",
        values: { modelSizeB: 65, quantBits: 4, blockSize: 64, rank: 64, alpha: 16 },
        toggles: { doubleQuant: true }
      },
      {
        name: "int8",
        description: "LLM.int8() style — no double quant",
        values: { modelSizeB: 7, quantBits: 8, blockSize: 128, rank: 16, alpha: 32 },
        toggles: { doubleQuant: false }
      },
      {
        name: "no-quant",
        description: "plain bf16 LoRA, no quantization",
        values: { modelSizeB: 7, quantBits: 16, blockSize: 64, rank: 16, alpha: 32 },
        toggles: { doubleQuant: false }
      }
    ]
  },
  {
    key: "distillation",
    label: "Distillation",
    eyebrow: "teacher signal into a student",
    icon: GraduationCap,
    accent: "var(--amber)",
    summary:
      "Use a larger model to teach a smaller model. The student learns labels plus the teacher's softer distribution over wrong-but-related answers.",
    bestFor: "Smaller deployment models, latency reduction, edge inference, model compression.",
    trainable: "The student model.",
    frozen: "The teacher, usually.",
    signal: "Hard labels, soft targets, hidden states, attention maps, or generated rationales.",
    risk: "A weak or biased teacher transfers its blind spots; too small a student cannot absorb everything.",
    controls: [
      {
        key: "teacherSizeB",
        label: "teacher size",
        min: 1,
        max: 500,
        step: 1,
        unit: "B params",
        term: "distillation",
        format: "integer"
      },
      {
        key: "studentSizeB",
        label: "student size",
        min: 0.1,
        max: 70,
        step: 0.1,
        unit: "B params",
        term: "distillation",
        format: "oneDecimal"
      },
      {
        key: "temperature",
        label: "temperature",
        min: 1,
        max: 20,
        step: 0.5,
        unit: "T",
        term: "temperature",
        format: "oneDecimal"
      },
      {
        key: "softTargetWeight",
        label: "soft target mix",
        min: 0,
        max: 1,
        step: 0.05,
        unit: "",
        term: "softTargets",
        format: "percent"
      }
    ],
    selectors: [
      {
        key: "distillFlavor",
        label: "what to match",
        options: [
          { value: "logits", label: "logits" },
          { value: "hidden", label: "hidden" },
          { value: "attention", label: "attn" },
          { value: "all", label: "all" }
        ],
        hint: (v) =>
          v === "logits"
            ? "classic Hinton — output distribution only"
            : v === "hidden"
              ? "FitNets / DistilBERT — intermediate features"
              : v === "attention"
                ? "TinyBERT / MiniLM — attention maps"
                : "all three combined"
      }
    ],
    steps: [
      "Run the teacher forward",
      "Soften teacher logits",
      "Run the student forward",
      "Blend label loss with teacher loss",
      "Update only the student",
      "Deploy the student alone"
    ],
    vocabulary: ["distillation", "softTargets", "temperature", "loss", "inference", "attention"],
    presets: [
      {
        name: "DistilBERT",
        description: "the canonical BERT compression result",
        values: { teacherSizeB: 0.11, studentSizeB: 0.066, temperature: 4, softTargetWeight: 0.5 },
        selectors: { distillFlavor: "hidden" }
      },
      {
        name: "TinyBERT",
        description: "BERT-base → 14M, attention transfer + hidden matching",
        values: { teacherSizeB: 0.11, studentSizeB: 0.014, temperature: 1, softTargetWeight: 1 },
        selectors: { distillFlavor: "all" }
      },
      {
        name: "Hinton 2015",
        description: "the original paper — soft targets only",
        values: { teacherSizeB: 0.06, studentSizeB: 0.006, temperature: 8, softTargetWeight: 0.9 },
        selectors: { distillFlavor: "logits" }
      },
      {
        name: "70B → 7B",
        description: "common LLM distillation target",
        values: { teacherSizeB: 70, studentSizeB: 7, temperature: 4, softTargetWeight: 0.7 },
        selectors: { distillFlavor: "logits" }
      },
      {
        name: "70B → 1B",
        description: "extreme compression for edge / mobile",
        values: { teacherSizeB: 70, studentSizeB: 1, temperature: 6, softTargetWeight: 0.8 },
        selectors: { distillFlavor: "logits" }
      },
      {
        name: "no teacher",
        description: "α = 0 — pure supervised baseline",
        values: { teacherSizeB: 70, studentSizeB: 7, temperature: 1, softTargetWeight: 0 },
        selectors: { distillFlavor: "logits" }
      }
    ]
  },
  {
    key: "reinforcement-learning",
    label: "RL",
    eyebrow: "optimize behavior from feedback",
    icon: Trophy,
    accent: "var(--green)",
    summary:
      "Generate candidate behavior, score it with humans, rules, or reward models, then update the policy toward higher-reward outputs while controlling drift.",
    bestFor: "Preference alignment, tool-use behavior, reasoning style, safety constraints.",
    trainable: "Usually a policy model or adapters on top of a policy.",
    frozen: "Often a reference policy and reward model.",
    signal: "Scalar rewards, pairwise preferences, verifier scores, or AI feedback.",
    risk: "Reward hacking, mode collapse, over-optimization, and hidden regressions.",
    controls: [
      commonControls[0],
      commonControls[1],
      {
        key: "rollouts",
        label: "rollouts",
        min: 1,
        max: 64,
        step: 1,
        unit: "samples",
        term: "policy",
        format: "integer"
      },
      {
        key: "rewardSignal",
        label: "reward quality",
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        term: "rewardModel",
        format: "integer"
      },
      {
        key: "klBeta",
        label: "KL β (drift leash)",
        min: 0,
        max: 1,
        step: 0.01,
        unit: "β",
        term: "policy",
        format: "decimal"
      }
    ],
    selectors: [
      {
        key: "rlAlgorithm",
        label: "algorithm",
        options: [
          { value: "ppo", label: "PPO" },
          { value: "dpo", label: "DPO" },
          { value: "grpo", label: "GRPO" },
          { value: "rlaif", label: "RLAIF" }
        ],
        hint: (v) =>
          v === "ppo"
            ? "InstructGPT — reward model + value head, KL-penalized updates"
            : v === "dpo"
              ? "preference data directly — no reward model, no value head"
              : v === "grpo"
                ? "DeepSeekMath — group-baselined PPO, drops the value head"
                : "AI feedback in place of humans — cheaper preference labels"
      }
    ],
    steps: [
      "Sample outputs from the policy",
      "Score outputs with a reward source",
      "Compare against a reference policy",
      "Estimate advantage or preference loss",
      "Update the policy carefully",
      "Audit regressions and reward hacking"
    ],
    vocabulary: ["rlhf", "policy", "rewardModel", "loss", "gradient", "inference"],
    presets: [
      {
        name: "RLHF (InstructGPT)",
        description: "PPO with a learned reward model, moderate KL leash",
        values: {
          modelSizeB: 7,
          sequenceLength: 2048,
          rollouts: 16,
          rewardSignal: 78,
          klBeta: 0.1
        },
        selectors: { rlAlgorithm: "ppo" }
      },
      {
        name: "DPO",
        description: "no reward model — pairwise preferences with tight KL",
        values: { modelSizeB: 7, sequenceLength: 2048, rollouts: 1, rewardSignal: 85, klBeta: 0.1 },
        selectors: { rlAlgorithm: "dpo" }
      },
      {
        name: "GRPO (DeepSeekMath)",
        description: "group-baselined PPO, many rollouts per prompt",
        values: {
          modelSizeB: 7,
          sequenceLength: 2048,
          rollouts: 32,
          rewardSignal: 90,
          klBeta: 0.05
        },
        selectors: { rlAlgorithm: "grpo" }
      },
      {
        name: "RLAIF",
        description: "AI feedback in place of humans, noisier signal",
        values: {
          modelSizeB: 7,
          sequenceLength: 2048,
          rollouts: 16,
          rewardSignal: 68,
          klBeta: 0.1
        },
        selectors: { rlAlgorithm: "rlaif" }
      },
      {
        name: "reward hacking risk",
        description: "high rollouts, weak β, mediocre reward — optimization wins, alignment loses",
        values: {
          modelSizeB: 7,
          sequenceLength: 2048,
          rollouts: 48,
          rewardSignal: 55,
          klBeta: 0.005
        },
        selectors: { rlAlgorithm: "ppo" }
      }
    ]
  }
];

export const architectures: Architecture[] = [
  {
    key: "decoder",
    label: "Decoder-only",
    icon: BrainCircuit,
    accent: "var(--cyan)",
    summary: "Predicts the next token from everything to the left.",
    trainingNote: "The standard shape for modern chat and completion LLMs.",
    inferenceNote:
      "KV cache makes repeated token generation much cheaper than recomputing the full prompt.",
    blocks: ["tokens", "causal attention", "MLP", "next token"]
  },
  {
    key: "encoder-decoder",
    label: "Encoder-decoder",
    icon: Workflow,
    accent: "var(--amber)",
    summary: "Reads an input sequence, then generates an output sequence conditioned on it.",
    trainingNote:
      "Great when input and output have different roles, like translation or summarization.",
    inferenceNote: "Encoder runs once; decoder autoregressively emits the answer.",
    blocks: ["source", "encoder", "cross attention", "decoder"]
  },
  {
    key: "moe",
    label: "Mixture of Experts",
    icon: GitBranch,
    accent: "var(--green)",
    summary: "Routes each token through a small subset of expert MLPs.",
    trainingNote: "Adds capacity without activating every parameter on every token.",
    inferenceNote: "Fast only when routing, batching, and expert placement are engineered well.",
    blocks: ["router", "expert 1", "expert 2", "merge"]
  },
  {
    key: "multimodal",
    label: "Multimodal",
    icon: Network,
    accent: "var(--violet)",
    summary: "Projects images, audio, or video into token-like representations.",
    trainingNote: "Often starts with frozen encoders, then aligns modalities with text.",
    inferenceNote: "Extra encoders add latency before the language model starts decoding.",
    blocks: ["media encoder", "projector", "language model", "response"]
  }
];

export const glossary: Record<GlossaryKey, GlossaryEntry> = {
  activation: {
    key: "activation",
    label: "Activation",
    definition: "A temporary tensor produced inside the model during the forward pass.",
    intuition:
      "These are the intermediate thoughts the model must keep around so gradients can be computed later."
  },
  adapter: {
    key: "adapter",
    label: "Adapter",
    definition: "A small trainable module added to a larger frozen model.",
    intuition: "It is a lightweight steering layer rather than a full rewrite of the model."
  },
  attention: {
    key: "attention",
    label: "Attention",
    definition: "The mechanism that lets tokens read information from other tokens.",
    intuition: "Longer sequences are expensive because attention compares many token pairs."
  },
  backprop: {
    key: "backprop",
    label: "Backpropagation",
    definition:
      "The algorithm that moves loss information backward through the model to compute gradients.",
    intuition: "It assigns credit and blame to weights after the model makes an error."
  },
  batch: {
    key: "batch",
    label: "Batch",
    definition: "A group of examples processed in one optimizer step.",
    intuition: "More examples per step smooth the signal but consume more memory."
  },
  checkpoint: {
    key: "checkpoint",
    label: "Checkpoint",
    definition: "A saved set of model weights, and sometimes optimizer state.",
    intuition: "It is the version of the model you can resume, evaluate, fine-tune, or ship."
  },
  distillation: {
    key: "distillation",
    label: "Distillation",
    definition:
      "Training a smaller student model from the outputs or internals of a larger teacher model.",
    intuition: "The teacher turns expensive knowledge into examples the student can absorb."
  },
  embedding: {
    key: "embedding",
    label: "Embedding",
    definition: "A vector representation of a token, patch, item, or feature.",
    intuition: "It is the numeric form the network can actually compute with."
  },
  fullTraining: {
    key: "fullTraining",
    label: "Full Training",
    definition: "Updating all or nearly all model weights during training.",
    intuition: "This gives maximum freedom and maximum cost."
  },
  gradient: {
    key: "gradient",
    label: "Gradient",
    definition: "A direction that tells each trainable value how to change to reduce loss.",
    intuition: "It is the model's correction signal."
  },
  inference: {
    key: "inference",
    label: "Inference",
    definition: "Running a trained model to produce predictions or generated outputs.",
    intuition: "Training changes weights; inference uses weights."
  },
  lora: {
    key: "lora",
    label: "LoRA",
    definition:
      "Low-Rank Adaptation: a method that trains small rank-constrained matrices instead of all weights.",
    intuition:
      "It learns a compact update that can be merged into the base model or served as an adapter."
  },
  loss: {
    key: "loss",
    label: "Loss",
    definition: "A number that measures how wrong the model was for the training objective.",
    intuition:
      "The optimizer is trying to make this number smaller without breaking other behavior."
  },
  optimizerState: {
    key: "optimizerState",
    label: "Optimizer State",
    definition: "Extra tensors an optimizer keeps for each trainable parameter.",
    intuition:
      "Adam is powerful partly because it remembers momentum and variance, but that memory costs bytes."
  },
  policy: {
    key: "policy",
    label: "Policy",
    definition: "In RL, the model being optimized to choose outputs or actions.",
    intuition:
      "For LLMs, the policy is usually the language model generating candidate completions."
  },
  qlora: {
    key: "qlora",
    label: "QLoRA",
    definition:
      "A fine-tuning recipe that combines quantized frozen weights with trainable LoRA adapters.",
    intuition: "The big model stays small in memory while a small adapter learns the task."
  },
  quantization: {
    key: "quantization",
    label: "Quantization",
    definition: "Representing weights or activations with fewer bits.",
    intuition: "It saves memory and bandwidth, but can introduce approximation error."
  },
  rank: {
    key: "rank",
    label: "Rank",
    definition: "The bottleneck dimension in a low-rank update.",
    intuition: "Higher rank gives adapters more capacity and costs more parameters."
  },
  rewardModel: {
    key: "rewardModel",
    label: "Reward Model",
    definition: "A model or scoring function that maps behavior to a reward.",
    intuition: "It tells RL what good looks like, which makes its blind spots very important."
  },
  rlhf: {
    key: "rlhf",
    label: "RLHF",
    definition: "Reinforcement Learning from Human Feedback.",
    intuition: "Human preferences become a training signal for model behavior."
  },
  sequence: {
    key: "sequence",
    label: "Sequence",
    definition: "The token span processed as one training example or inference context.",
    intuition:
      "A longer sequence gives more context, but attention and activations become more expensive."
  },
  softTargets: {
    key: "softTargets",
    label: "Soft Targets",
    definition: "A teacher model's probability distribution over possible outputs.",
    intuition: "The wrong answers still carry information about similarity and uncertainty."
  },
  temperature: {
    key: "temperature",
    label: "Temperature",
    definition: "A scaling factor that sharpens or softens logits before softmax.",
    intuition: "Higher temperature exposes more of the teacher's uncertainty."
  }
};

export const roadmap = [
  {
    icon: Gauge,
    title: "Inference Lab",
    copy: "KV cache, batching, speculative decoding, quantized serving, latency, and throughput."
  },
  {
    icon: Route,
    title: "Training Recipes",
    copy: "Dataset mix, eval loops, checkpoint cadence, optimizer choices, and failure modes."
  },
  {
    icon: Sparkles,
    title: "Architecture Playground",
    copy: "Decoder-only, encoder-decoder, MoE, multimodal, diffusion, and hybrid systems."
  }
];

export function getMethod(key: MethodKey) {
  return methods.find((method) => method.key === key) ?? methods[0];
}
