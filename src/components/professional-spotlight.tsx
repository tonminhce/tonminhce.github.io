import { ArrowDownRight, Layers3, RotateCcw, ShieldCheck } from "lucide-react";

/** Owner-provided professional work; benchmark figures retain their test context. */
export function ProfessionalSpotlight() {
  return (
    <article
      className="professional-spotlight"
      aria-labelledby="platform-title"
      data-reveal
    >
      <div className="spotlight-heading">
        <span className="spotlight-kicker">
          <span /> SELECTED PROFESSIONAL WORK
        </span>
        <span className="spotlight-company">
          VNPT IT <span>/</span> AI-DRIVEN PLATFORM
        </span>
      </div>
      <div className="spotlight-main">
        <div className="spotlight-copy">
          <h3 id="platform-title">
            AI workflows
            <br />
            <em>that recover.</em>
          </h3>
          <p>
            A Go runtime orchestrator with sandboxed execution, checkpoint
            recovery, and tenant concurrency controls.
          </p>
          <a href="#vnpt-ai" className="spotlight-link">
            Read the engineering details <ArrowDownRight size={18} />
          </a>
        </div>
        <aside
          className="spotlight-evidence"
          aria-label="Integration test results"
        >
          <span className="evidence-eyebrow">BUILT TO KEEP UP</span>
          <div className="evidence-numbers">
            <div>
              <strong>
                250<span>ms</span>
              </strong>
              <p>p99 fanout lag</p>
            </div>
            <div>
              <strong>100</strong>
              <p>concurrent subscribers</p>
            </div>
          </div>
          <p className="evidence-caption">
            Validated together in an integration test.
          </p>
          <span className="evidence-rule" />
          <div className="evidence-note">
            <span>GO / DOCKER / REDIS</span>
            <p>Internal AI software factory for the SDLC.</p>
            <small>Runner-up at VNPT’s internal hackathon.</small>
          </div>
        </aside>
      </div>
      <div className="spotlight-principles">
        <div>
          <ShieldCheck size={20} strokeWidth={1.5} />
          <span>
            <strong>Isolated by design</strong>
            <small>A fresh container per command.</small>
          </span>
        </div>
        <div>
          <RotateCcw size={20} strokeWidth={1.5} />
          <span>
            <strong>Ready to recover</strong>
            <small>Resume from saved checkpoints.</small>
          </span>
        </div>
        <div>
          <Layers3 size={20} strokeWidth={1.5} />
          <span>
            <strong>Concurrency, controlled</strong>
            <small>Redis-backed limits per tenant.</small>
          </span>
        </div>
      </div>
    </article>
  );
}
