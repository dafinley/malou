import type { MethodKey } from "@/src/data/training";

export type Reference = {
  title: string;
  authors?: string;
  year?: number;
  href: string;
  kind: "paper" | "blog" | "code" | "book";
};

export type EducationContent = {
  math: { title: string; body: string; latex?: string };
  whenToUse: { good: string[]; avoid: string[] };
  recipe: { language: "python"; description: string; code: string };
  references: Reference[];
  intuition: string;
};

export const education: Record<MethodKey, EducationContent> = {
  "full-training": {
    intuition:
      "Full training treats every parameter as a free variable. The model gets maximum capacity to absorb the corpus, and the optimizer pays for every one of those degrees of freedom in memory and FLOPs.",
    math: {
      title: "Objective and update rule",
      body: "Minimize next-token cross-entropy over the full corpus. Every weight receives a gradient on every step. Adam-style optimizers keep first and second moment tensors per parameter, which is why the optimizer state is roughly four times the weight tensor in mixed precision.",
      latex: "L(θ) = -Σ_t log p_θ(x_t | x_<t)\nθ_{t+1} = θ_t - η · m̂_t / (√v̂_t + ε)"
    },
    whenToUse: {
      good: [
        "Pretraining a new base model from scratch",
        "Tokenizer or architecture changes that ripple through every layer",
        "Domain-specific bases when the target distribution is very far from any open model"
      ],
      avoid: [
        "You only have task supervision (use LoRA/QLoRA)",
        "GPU budget is limited",
        "You need to ship a quick behavior change"
      ]
    },
    recipe: {
      language: "python",
      description: "Sketch of a mixed-precision training loop with gradient accumulation.",
      code: `import torch
from torch.optim import AdamW

model = build_model()  # all params trainable
optimizer = AdamW(model.parameters(), lr=2e-4, weight_decay=0.1)
scaler = torch.cuda.amp.GradScaler()

for step, batch in enumerate(loader):
    with torch.cuda.amp.autocast(dtype=torch.bfloat16):
        loss = model(batch).loss / accum_steps

    scaler.scale(loss).backward()

    if (step + 1) % accum_steps == 0:
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        scaler.step(optimizer)
        scaler.update()
        optimizer.zero_grad(set_to_none=True)`
    },
    references: [
      {
        title: "Language Models are Few-Shot Learners (GPT-3)",
        authors: "Brown et al.",
        year: 2020,
        href: "https://arxiv.org/abs/2005.14165",
        kind: "paper"
      },
      {
        title: "Training Compute-Optimal Large Language Models (Chinchilla)",
        authors: "Hoffmann et al.",
        year: 2022,
        href: "https://arxiv.org/abs/2203.15556",
        kind: "paper"
      },
      {
        title: "The Llama 3 Herd of Models",
        authors: "Meta AI",
        year: 2024,
        href: "https://arxiv.org/abs/2407.21783",
        kind: "paper"
      }
    ]
  },
  "adapter-finetuning": {
    intuition:
      "A frozen base model contains most of the knowledge. LoRA learns a small low-rank update beside it, so capacity is bounded by rank rather than parameter count. The update can be merged back into the weights at inference time, leaving zero overhead.",
    math: {
      title: "Low-rank reparameterization",
      body: "Replace ΔW (a d × k matrix) with the product B · A, where B is d × r and A is r × k. Train only A and B, freeze W. With r ≪ min(d, k), the trainable footprint drops from d · k to (d + k) · r per matrix.",
      latex: "W' = W + ΔW = W + B · A\nB ∈ R^{d×r},  A ∈ R^{r×k},  r ≪ min(d, k)"
    },
    whenToUse: {
      good: [
        "Instruction tuning, style transfer, persona work",
        "Many task adapters served from one base",
        "Fast iteration on data quality"
      ],
      avoid: [
        "Tokenizer or vocabulary changes",
        "Tasks demanding capacity the base genuinely lacks",
        "Pretraining a model from scratch"
      ]
    },
    recipe: {
      language: "python",
      description: "Inject LoRA adapters with PEFT and train only those parameters.",
      code: `from transformers import AutoModelForCausalLM
from peft import LoraConfig, get_peft_model

base = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3-8B")

config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(base, config)
model.print_trainable_parameters()
# trainable params: ~21M | all params: ~8B | trainable%: 0.26`
    },
    references: [
      {
        title: "LoRA: Low-Rank Adaptation of Large Language Models",
        authors: "Hu et al.",
        year: 2021,
        href: "https://arxiv.org/abs/2106.09685",
        kind: "paper"
      },
      {
        title: "PEFT: State-of-the-art Parameter-Efficient Fine-Tuning",
        authors: "Hugging Face",
        href: "https://github.com/huggingface/peft",
        kind: "code"
      },
      {
        title: "DoRA: Weight-Decomposed Low-Rank Adaptation",
        authors: "Liu et al.",
        year: 2024,
        href: "https://arxiv.org/abs/2402.09353",
        kind: "paper"
      }
    ]
  },
  qlora: {
    intuition:
      "QLoRA keeps a giant frozen base in 4-bit storage and dequantizes blocks on the fly for matmul. The adapter still trains in higher precision. The combination lets you fine-tune 65B+ models on a single high-end GPU.",
    math: {
      title: "Quantized weights with high-precision updates",
      body: "Store W in 4-bit NormalFloat (NF4) with a block scale. At forward time, dequantize a block back to bf16 just before the matmul, then add the bf16 LoRA term. Gradients flow only into A and B.",
      latex: "ŷ = dequant(W_q) · x + B · A · x\nΔbytes ≈ 16 / b · |W|  (b = bit width)"
    },
    whenToUse: {
      good: [
        "Fine-tuning 30B+ models on a single GPU",
        "Multi-adapter serving where base is shared",
        "Memory-bound research labs and indie builders"
      ],
      avoid: [
        "Latency-critical inference (dequant adds work)",
        "Training that exposes quantization-sensitive layers",
        "When bf16 LoRA already fits comfortably"
      ]
    },
    recipe: {
      language: "python",
      description: "Load a base in NF4 with double-quantization, then attach LoRA adapters.",
      code: `from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
import torch

bnb = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.bfloat16,
)

base = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3-70B",
    quantization_config=bnb,
    device_map="auto",
)

base = prepare_model_for_kbit_training(base)
model = get_peft_model(base, LoraConfig(r=32, lora_alpha=64, task_type="CAUSAL_LM"))`
    },
    references: [
      {
        title: "QLoRA: Efficient Finetuning of Quantized LLMs",
        authors: "Dettmers et al.",
        year: 2023,
        href: "https://arxiv.org/abs/2305.14314",
        kind: "paper"
      },
      {
        title: "bitsandbytes",
        authors: "Dettmers and contributors",
        href: "https://github.com/bitsandbytes-foundation/bitsandbytes",
        kind: "code"
      },
      {
        title: "GPTQ: Accurate Post-Training Quantization",
        authors: "Frantar et al.",
        year: 2022,
        href: "https://arxiv.org/abs/2210.17323",
        kind: "paper"
      }
    ]
  },
  distillation: {
    intuition:
      "A capable teacher knows more than the right answer — its softmax has texture across wrong-but-related options. Train a smaller student against that softer distribution and you transfer reasoning style, not just labels.",
    math: {
      title: "Soft cross-entropy with temperature",
      body: "Soften the teacher and student logits by temperature T before applying softmax. Train on a mix of hard label loss and the KL divergence between softened distributions. Higher T spreads probability mass and exposes more teacher uncertainty.",
      latex:
        "p_T(x) = softmax(z(x) / T)\nL = α · CE(y, p_S^{T=1}) + (1 - α) · T² · KL(p_T^T || p_S^T)"
    },
    whenToUse: {
      good: [
        "Shipping a smaller model with most of the teacher's behavior",
        "Edge or on-device deployment",
        "Compressing a slow ensemble into one model"
      ],
      avoid: [
        "Teacher is biased or unreliable",
        "Student capacity is too small to track the teacher",
        "You can fine-tune the target size directly with similar cost"
      ]
    },
    recipe: {
      language: "python",
      description: "Soft-target distillation with a temperature-scaled KL term.",
      code: `import torch
import torch.nn.functional as F

T = 4.0
alpha = 0.3

for batch in loader:
    with torch.no_grad():
        teacher_logits = teacher(batch.input_ids).logits

    student_logits = student(batch.input_ids).logits

    hard_loss = F.cross_entropy(
        student_logits.view(-1, V),
        batch.labels.view(-1),
        ignore_index=-100,
    )

    soft_loss = F.kl_div(
        F.log_softmax(student_logits / T, dim=-1),
        F.softmax(teacher_logits / T, dim=-1),
        reduction="batchmean",
    ) * (T * T)

    loss = alpha * hard_loss + (1 - alpha) * soft_loss
    loss.backward()`
    },
    references: [
      {
        title: "Distilling the Knowledge in a Neural Network",
        authors: "Hinton, Vinyals, Dean",
        year: 2015,
        href: "https://arxiv.org/abs/1503.02531",
        kind: "paper"
      },
      {
        title: "DistilBERT, a Distilled Version of BERT",
        authors: "Sanh et al.",
        year: 2019,
        href: "https://arxiv.org/abs/1910.01108",
        kind: "paper"
      },
      {
        title: "MiniLLM: Knowledge Distillation of Large Language Models",
        authors: "Gu et al.",
        year: 2023,
        href: "https://arxiv.org/abs/2306.08543",
        kind: "paper"
      }
    ]
  },
  "reinforcement-learning": {
    intuition:
      "Supervised loss tells the model what to copy. Reward tells it what to prefer. RL closes a loop: sample, score, update toward higher-reward samples while a KL term keeps the policy from drifting away from a sane reference.",
    math: {
      title: "Policy gradient with a KL leash",
      body: "Maximize expected reward minus β times the KL divergence to a reference policy. Modern recipes (PPO, GRPO, DPO) all share this skeleton: a scalar signal pulls behavior up, a divergence term pulls it back toward something trusted.",
      latex: "J(π) = E[R(x, y)] - β · KL(π || π_ref)\n∇J ≈ E[A(x, y) · ∇ log π(y | x)] - β · ∇KL"
    },
    whenToUse: {
      good: [
        "Preference alignment (RLHF, RLAIF)",
        "Tool-use, reasoning, agentic behavior shaping",
        "Constraints that supervised data cannot express directly"
      ],
      avoid: [
        "Your reward model is noisy or game-able",
        "You have no reference policy to anchor against",
        "Supervised fine-tuning already solves the task"
      ]
    },
    recipe: {
      language: "python",
      description:
        "Direct Preference Optimization — RL signal from pairwise preference data, no reward model required.",
      code: `from trl import DPOTrainer, DPOConfig
from transformers import AutoModelForCausalLM, AutoTokenizer

policy = AutoModelForCausalLM.from_pretrained("base-instruct")
reference = AutoModelForCausalLM.from_pretrained("base-instruct")
tokenizer = AutoTokenizer.from_pretrained("base-instruct")

trainer = DPOTrainer(
    model=policy,
    ref_model=reference,
    args=DPOConfig(
        beta=0.1,
        learning_rate=5e-7,
        per_device_train_batch_size=4,
    ),
    train_dataset=preference_dataset,  # {prompt, chosen, rejected}
    tokenizer=tokenizer,
)

trainer.train()`
    },
    references: [
      {
        title: "Training Language Models to Follow Instructions with Human Feedback (InstructGPT)",
        authors: "Ouyang et al.",
        year: 2022,
        href: "https://arxiv.org/abs/2203.02155",
        kind: "paper"
      },
      {
        title: "Direct Preference Optimization",
        authors: "Rafailov et al.",
        year: 2023,
        href: "https://arxiv.org/abs/2305.18290",
        kind: "paper"
      },
      {
        title: "Group Relative Policy Optimization (DeepSeekMath)",
        authors: "Shao et al.",
        year: 2024,
        href: "https://arxiv.org/abs/2402.03300",
        kind: "paper"
      },
      {
        title: "trl — Transformer Reinforcement Learning",
        authors: "Hugging Face",
        href: "https://github.com/huggingface/trl",
        kind: "code"
      }
    ]
  }
};
