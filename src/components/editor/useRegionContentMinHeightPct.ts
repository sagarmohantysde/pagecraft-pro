import { useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";

interface UseRegionContentMinHeightPctArgs {
  type: "header" | "body" | "footer";
  editor: Editor | null;
  a4HeightPx: number;
  minPx?: number;
  maxPct?: number;
  /** Extra pixels to account for padding, borders, etc. */
  extraPx?: number;
}

/**
 * Computes a minimum % height for header/footer that keeps current content visible.
 * (Body is always auto, so returns 0.)
 */
export function useRegionContentMinHeightPct({
  type,
  editor,
  a4HeightPx,
  minPx = 60,
  maxPct = 40,
  extraPx = 0,
}: UseRegionContentMinHeightPctArgs) {
  const [minPct, setMinPct] = useState(0);

  const enabled = useMemo(() => type !== "body" && !!editor, [type, editor]);

  useEffect(() => {
    if (!enabled || !editor) return;

    const el = editor.view.dom as HTMLElement;
    if (!el) return;

    const compute = () => {
      const contentPx = Math.max(minPx, el.scrollHeight + extraPx);
      const pct = (contentPx / a4HeightPx) * 100;
      setMinPct(Math.min(maxPct, pct));
    };

    compute();

    const ro = new ResizeObserver(() => compute());
    ro.observe(el);

    return () => ro.disconnect();
  }, [a4HeightPx, editor, enabled, extraPx, maxPct, minPx]);

  return minPct;
}
