"use client";

import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole
} from "@floating-ui/react";
import { useState } from "react";
import { glossary, type GlossaryKey } from "@/src/data/training";

export function Term({ id, children }: { id: GlossaryKey; children?: React.ReactNode }) {
  const entry = glossary[id];
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top",
    strategy: "fixed",
    middleware: [offset(8), flip({ padding: 12 }), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate
  });
  const hover = useHover(context, { move: false, mouseOnly: true, handleClose: safePolygon() });
  const focus = useFocus(context);
  const click = useClick(context, { ignoreMouse: true });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    click,
    dismiss,
    role
  ]);

  return (
    <>
      <span
        {...getReferenceProps({
          className: "term",
          role: "button",
          tabIndex: 0,
          ref: refs.setReference
        })}
      >
        {children ?? entry.label}
      </span>
      {open ? (
        <FloatingPortal>
          <div
            {...getFloatingProps({
              className: "tooltip",
              ref: refs.setFloating,
              style: { ...floatingStyles, visibility: isPositioned ? "visible" : "hidden" }
            })}
          >
            <strong>{entry.label}</strong>
            <span>{entry.definition}</span>
            <em>{entry.intuition}</em>
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}
