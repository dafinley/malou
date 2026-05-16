"use client";

import type { Method, SelectorKey } from "@/src/data/training";
import type { Toggles, Values } from "@/src/lib/derive-stats";
import { DistillationLab } from "./distillation/distillation-lab";
import { FullTrainingLab } from "./full-training/full-training-lab";
import { LoraLab } from "./lora/lora-lab";
import { QloraLab } from "./qlora/qlora-lab";
import { RlLab } from "./rl/rl-lab";

export function MethodLab({
  method,
  values,
  toggles,
  selectors
}: {
  method: Method;
  values: Values;
  toggles: Toggles;
  selectors: Record<SelectorKey, string>;
}) {
  switch (method.key) {
    case "full-training":
      return <FullTrainingLab method={method} values={values} />;
    case "adapter-finetuning":
      return <LoraLab method={method} values={values} />;
    case "qlora":
      return <QloraLab method={method} toggles={toggles} values={values} />;
    case "distillation":
      return <DistillationLab method={method} selectors={selectors} values={values} />;
    case "reinforcement-learning":
      return <RlLab method={method} selectors={selectors} values={values} />;
  }
}
