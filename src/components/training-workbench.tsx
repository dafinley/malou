"use client";

import { useCallback, useMemo, useState } from "react";
import { ArchitectureExplorer } from "@/src/components/architecture-explorer";
import { ComparisonView } from "@/src/components/comparison-view";
import { ControlPanel } from "@/src/components/control-panel";
import { GlossaryPanel } from "@/src/components/glossary-panel";
import { WorkbenchHeader } from "@/src/components/header";
import { InferenceFoundation } from "@/src/components/inference-foundation";
import { MethodEducation } from "@/src/components/method-education";
import { MethodLab } from "@/src/components/method-lab";
import { MethodNav } from "@/src/components/method-nav";
import { MethodSummary } from "@/src/components/method-summary";
import { RoadmapStrip } from "@/src/components/roadmap-strip";
import { TrainingFlow } from "@/src/components/training-flow";
import {
  defaultSelectors,
  defaultToggles,
  defaultValues,
  getMethod,
  type ArchitectureKey,
  type ControlKey,
  type MethodKey,
  type MethodPreset,
  type SelectorKey,
  type ToggleKey
} from "@/src/data/training";
import { deriveStats } from "@/src/lib/derive-stats";
import { useUrlState, type SerializedState } from "@/src/lib/url-state";

const initialMethod: MethodKey = "adapter-finetuning";
const initialArchitecture: ArchitectureKey = "decoder";

const initialState: SerializedState = {
  method: initialMethod,
  architecture: initialArchitecture,
  values: defaultValues,
  toggles: defaultToggles,
  selectors: defaultSelectors
};

const repoUrl = process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/dafinley/malou";

export function TrainingWorkbench() {
  const [state, update] = useUrlState(initialState);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  const {
    method: activeMethod,
    architecture: activeArchitecture,
    values,
    toggles,
    selectors
  } = state;

  const method = getMethod(activeMethod);
  const stats = useMemo(
    () => deriveStats(activeMethod, values, toggles),
    [activeMethod, values, toggles]
  );

  const setValue = useCallback(
    (key: ControlKey, value: number) => {
      update({ values: { [key]: value } });
    },
    [update]
  );

  const setToggle = useCallback(
    (key: ToggleKey, value: boolean) => {
      update({ toggles: { [key]: value } });
    },
    [update]
  );

  const setSelector = useCallback(
    (key: SelectorKey, value: string) => {
      update({ selectors: { [key]: value } });
    },
    [update]
  );

  const switchMethod = useCallback(
    (key: MethodKey) => {
      const next = getMethod(key);
      const preset = next.presets?.[0];
      update({
        method: key,
        values: preset?.values,
        toggles: preset?.toggles,
        selectors: preset?.selectors
      });
    },
    [update]
  );

  const applyPreset = useCallback(
    (preset: MethodPreset) => {
      update({
        values: preset.values,
        toggles: preset.toggles,
        selectors: preset.selectors
      });
    },
    [update]
  );

  const resetAll = useCallback(() => {
    update({
      method: initialMethod,
      architecture: initialArchitecture,
      values: defaultValues,
      toggles: defaultToggles,
      selectors: defaultSelectors
    });
  }, [update]);

  const setArchitecture = useCallback(
    (key: ArchitectureKey) => {
      update({ architecture: key });
    },
    [update]
  );

  return (
    <main className="app-shell">
      <WorkbenchHeader repoUrl={repoUrl} />
      <MethodNav active={activeMethod} onChange={switchMethod} />

      <div className="workspace-grid">
        <ControlPanel
          applyPreset={applyPreset}
          method={method}
          resetAll={resetAll}
          selectors={selectors}
          setSelector={setSelector}
          setToggle={setToggle}
          setValue={setValue}
          toggles={toggles}
          values={values}
        />

        <div className="workspace-main">
          <MethodSummary method={method} stats={stats} />
          <TrainingFlow method={method} />
          <MethodLab method={method} selectors={selectors} toggles={toggles} values={values} />
          <MethodEducation method={method} />

          <details
            className="workbench-section comparison-toggle-wrap"
            onToggle={(event) => setComparisonOpen((event.target as HTMLDetailsElement).open)}
            open={comparisonOpen}
          >
            <summary>
              <span>Compare methods side by side</span>
              <small>{comparisonOpen ? "hide" : "show"}</small>
            </summary>
            {comparisonOpen ? <ComparisonView baseValues={values} /> : null}
          </details>

          <GlossaryPanel method={method} />
          <ArchitectureExplorer active={activeArchitecture} onChange={setArchitecture} />
          <InferenceFoundation stats={stats} />
          <RoadmapStrip />
        </div>
      </div>

      <footer className="app-footer">
        <p>
          Molou is MIT-licensed. Patches, new methods, and educational improvements are welcome on{" "}
          <a href={repoUrl} rel="noopener noreferrer" target="_blank">
            GitHub
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
