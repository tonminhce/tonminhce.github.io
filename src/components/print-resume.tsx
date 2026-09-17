"use client";
export function PrintResume() {
  return (
    <button className="button" onClick={() => window.print()}>
      Print / Save PDF
    </button>
  );
}
