"use client";

import { useCallback, useEffect, useRef } from "react";
import { useOverviewMotion } from "./overview-motion";

/** Keep native details semantics and the no-JavaScript disclosure fallback. */
export function ExperienceDisclosure({
  name,
  stack,
  defaultOpen = false,
  children,
}: {
  name: string;
  stack: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const animation = useRef<Animation | null>(null);
  const intendedOpen = useRef(defaultOpen);
  const { paused } = useOverviewMotion();

  const finish = useCallback(() => {
    animation.current?.cancel();
    animation.current = null;
    const element = ref.current;
    if (!element) return;
    element.open = intendedOpen.current;
    element.style.height = "";
    element.style.overflow = "";
    element.dataset.expanded = String(intendedOpen.current);
  }, []);

  useEffect(() => {
    if (paused) finish();
  }, [paused, finish]);

  useEffect(() => {
    window.addEventListener("resize", finish);
    return () => {
      window.removeEventListener("resize", finish);
      animation.current?.cancel();
    };
  }, [finish]);

  return (
    <details
      ref={ref}
      open={defaultOpen}
      className="experience-disclosure"
      data-expanded={defaultOpen}
      onToggle={() => {
        if (!animation.current && ref.current) {
          intendedOpen.current = ref.current.open;
          ref.current.dataset.expanded = String(ref.current.open);
        }
      }}
    >
      <summary
        onClick={(event) => {
          const element = ref.current;
          if (!element) return;
          event.preventDefault();
          intendedOpen.current = !intendedOpen.current;
          if (
            paused ||
            matchMedia("(prefers-reduced-motion: reduce)").matches
          ) {
            finish();
            return;
          }
          const start = element.getBoundingClientRect().height;
          animation.current?.cancel();
          element.style.height = `${start}px`;
          element.style.overflow = "hidden";
          element.open = true;
          element.dataset.expanded = String(intendedOpen.current);
          const summary = element.querySelector("summary")!;
          const content =
            element.querySelector<HTMLElement>(".experience-detail")!;
          const end =
            summary.getBoundingClientRect().height +
            1 +
            (intendedOpen.current ? content.offsetHeight : 0);
          const motion = element.animate(
            { height: [`${start}px`, `${end}px`] },
            {
              duration: 460,
              easing: "cubic-bezier(.22, 1, .36, 1)",
              fill: "forwards",
            },
          );
          animation.current = motion;
          motion.onfinish = finish;
        }}
      >
        <span>
          {name}
          <small>{stack}</small>
        </span>
        <span className="disclosure-icon" aria-hidden="true">
          <i />
          <i />
        </span>
      </summary>
      <div className="experience-detail">{children}</div>
    </details>
  );
}
