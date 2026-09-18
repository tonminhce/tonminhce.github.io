"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { profile } from "@/data/portfolio";

export function CopyEmail() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <span className="copy-email-control" data-state={state}>
      <button
        className="copy-email"
        type="button"
        aria-label={state === "copied" ? "Email copied" : "Copy email address"}
        onClick={async () => {
          clearTimeout(timer.current);
          try {
            await navigator.clipboard.writeText(profile.email);
            setState("copied");
          } catch {
            setState("failed");
          }
          timer.current = setTimeout(() => setState("idle"), 3000);
        }}
      >
        {state === "copied" ? <Check size={16} /> : <Copy size={16} />}
        <span>{state === "copied" ? "Copied" : "Copy email"}</span>
      </button>
      <span className="copy-email-status" role="status">
        {state === "copied"
          ? "Email address copied."
          : state === "failed"
            ? "Copy isn’t available. You can select the email address instead."
            : ""}
      </span>
    </span>
  );
}
