"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Map,
  RotateCcw,
  Pause,
  Play,
  Package,
  Check,
  LockKeyhole,
  Compass,
  Github,
  Linkedin,
  Navigation,
  Mail,
  HelpCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  stops,
  achievements,
  emptyProgress,
  readProgress,
  type StopId,
  type Progress,
} from "@/data/world";
import { experience, certifications, profile } from "@/data/portfolio";
import type { DrivingWorld } from "@/lib/driving-world";
import type { DriveInput } from "@/lib/driving-physics";
import { StopIllustration } from "@/components/stop-illustration";
import { ExperienceDisclosure } from "@/components/experience-disclosure";
import { CopyEmail } from "@/components/copy-email";

export function DrivingPortfolio() {
  const container = useRef<HTMLDivElement>(null);
  const world = useRef<DrivingWorld>();
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    "loading",
  );
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const progressRef = useRef<Progress>(emptyProgress);
  const [car, setCar] = useState({
    x: 0,
    z: 11,
    heading: Math.PI,
    speed: 0,
    distance: 0,
    nearby: null as StopId | null,
  });
  const [panel, setPanel] = useState<
    StopId | "map" | "achievements" | "help" | null
  >(null);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [intro, setIntro] = useState(true);
  const earned = useRef(new Set<string>());
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const [entering, setEntering] = useState<StopId | null>(null);
  const enteringRef = useRef<StopId | null>(null);
  const arrivalSkip = useRef<HTMLButtonElement>(null);
  const [lastPanel, setLastPanel] = useState<typeof panel>(null);
  const opener = useRef<HTMLElement | null>(null);

  function updateProgress(next: Progress) {
    progressRef.current = next;
    setProgress(next);
    for (const a of achievements)
      if (a.goal(next) && !earned.current.has(a.id)) {
        earned.current.add(a.id);
        setToast(a.title);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 4200);
      }
  }
  const enterStop = useRef((id: StopId) => {});
  enterStop.current = (id: StopId) => {
    if (enteringRef.current) return;
    opener.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    enteringRef.current = id;
    setEntering(id);
    setIntro(false);
    setPaused(false);
    const show = () => {
      if (!enteringRef.current) return;
      if (!progressRef.current.visited.includes(id))
        updateProgress({
          ...progressRef.current,
          visited: [...progressRef.current.visited, id],
        });
      setLastPanel(id);
      setPanel(id);
      setEntering(null);
      enteringRef.current = null;
    };
    if (world.current) world.current.enterStop(id, show);
    else show();
  };
  function closePanel() {
    world.current?.leaveStop();
    setPanel(null);
  }
  useEffect(() => {
    let cancelled = false;
    const saved = readProgress();
    progressRef.current = saved;
    setProgress(saved);
    achievements.forEach((a) => {
      if (a.goal(saved)) earned.current.add(a.id);
    });
    import("@/lib/driving-world")
      .then(({ DrivingWorld }) => {
        if (cancelled || !container.current) return;
        try {
          world.current = new DrivingWorld(
            container.current,
            {
              onUpdate(state) {
                setCar(state);
                if (state.distance > progressRef.current.distance + 1)
                  updateProgress({
                    ...progressRef.current,
                    distance: state.distance,
                  });
                // Only this visit's driving can dismiss the introduction.
                // Saved lifetime distance must not change the initial layout.
                if (state.distance - saved.distance > 12) setIntro(false);
              },
              onPacket(id) {
                if (!progressRef.current.collected.includes(id))
                  updateProgress({
                    ...progressRef.current,
                    collected: [...progressRef.current.collected, id],
                  });
              },
              onInteract(id) {
                enterStop.current(id);
              },
              onError() {
                enteringRef.current = null;
                setEntering(null);
                setStatus("failed");
              },
            },
            saved,
          );
          setStatus("ready");
        } catch {
          setStatus("failed");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });
    const save = () => {
      try {
        localStorage.setItem(
          "minh-world-v1",
          JSON.stringify(progressRef.current),
        );
      } catch {
        /* Storage is optional. */
      }
    };
    const timer = setInterval(save, 2500);
    window.addEventListener("pagehide", save);
    return () => {
      cancelled = true;
      world.current?.dispose();
      world.current = undefined;
      save();
      clearInterval(timer);
      clearTimeout(toastTimer.current);
      window.removeEventListener("pagehide", save);
    };
  }, []);
  useEffect(() => {
    world.current?.pause(
      status !== "ready" || paused || panel !== null || entering !== null,
    );
  }, [paused, panel, status, entering]);
  useEffect(() => {
    const page = container.current?.closest("main");
    page
      ?.querySelectorAll<HTMLElement>(
        ".world-header, .world-intro, .world-mobile-start, .world-minimap, .world-footer, .touch-drive, .world-canvas",
      )
      .forEach((element) => {
        element.inert = entering !== null;
      });
    if (entering) arrivalSkip.current?.focus({ preventScroll: true });
  }, [entering]);
  function openPanel(next: typeof panel) {
    if (enteringRef.current) return;
    opener.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    world.current?.pause(true);
    setLastPanel(next);
    setPanel(next);
  }
  function travel(id: StopId) {
    if (enteringRef.current || status !== "ready" || !world.current) return;
    world.current?.teleport(id);
    setPanel(null);
    setPaused(false);
    setIntro(false);
  }
  function hold(key: keyof DriveInput, value: boolean) {
    world.current?.setInput(key, value);
    if (value) setIntro(false);
  }
  function startExploring() {
    setIntro(false);
    container.current?.querySelector("canvas")?.focus();
  }
  const near = stops.find((s) => s.id === car.nearby);
  const displayPanel = panel || lastPanel;
  const active = stops.find((s) => s.id === displayPanel);
  const arriving = stops.find((s) => s.id === entering);
  const count = achievements.filter((a) => a.goal(progress)).length;
  const nextStop = [stops[1], stops[0], ...stops.slice(2)].find(
    (stop) => !progress.visited.includes(stop.id),
  );
  return (
    <main
      className={`driving-page world-${status} ${
        entering ? "is-entering" : ""
      } ${panel ? "has-panel" : ""} ${intro ? "is-intro" : "is-exploring"}`}
      style={
        {
          "--stop-accent": arriving?.color || active?.color || "#d36a42",
        } as CSSProperties
      }
    >
      <div className="world-canvas" ref={container} />
      <div className="world-vignette" />
      <header className="world-header">
        <Link href="/" className="world-brand" aria-label="Minh’s world home">
          <span className="world-logo">
            m<span>.</span>
          </span>
          <span>
            NGUYEN TON MINH<small>JAVA & BACKEND ENGINEER</small>
          </span>
        </Link>
        <div className="world-header-actions">
          <Link href="/overview/" className="world-text-link">
            Portfolio <ArrowUpRight size={16} />
          </Link>
          <button
            className="world-icon-button"
            aria-label="Open campus map"
            onClick={() => openPanel("map")}
          >
            <Map size={19} />
            <span>Map</span>
          </button>
          <button
            className="world-achievement-button"
            aria-label={`Achievements, ${count} of ${achievements.length} unlocked`}
            onClick={() => openPanel("achievements")}
          >
            <Trophy size={18} />
            <span>
              {count}
              <span className="count-divider"> / {achievements.length}</span>
            </span>
          </button>
        </div>
      </header>
      <div className={`world-intro ${intro ? "" : "world-intro-compact"}`}>
        <p className="world-eyebrow">
          <span /> WELCOME TO MY LITTLE CORNER
        </p>
        <h1>
          Serious systems.
          <br />
          <span>A playful world.</span>
        </h1>
        <p className="world-intro-copy">
          <span className="intro-copy-long">
            I’m Minh. I build backends with Java & Go. Hop in and discover the
            work, the ideas, and the person behind the code.
          </span>
          <span className="intro-copy-short">
            I’m Minh. Java & Go engineer.
            <br />
            Welcome to my little world.
          </span>
        </p>
        {intro ? (
          <div className="world-intro-actions">
            <button
              className="world-primary"
              disabled={status !== "ready"}
              onClick={startExploring}
            >
              Let’s explore <ArrowRight size={17} />
            </button>
            <span>5 places. Your own pace.</span>
          </div>
        ) : (
          <button className="world-next-stop" onClick={() => openPanel("map")}>
            <span className="next-stop-icon">
              <Compass size={19} />
            </span>
            <span>
              <small>
                {nextStop
                  ? "YOUR NEXT DISCOVERY"
                  : "THE WHOLE WORLD, DISCOVERED"}
              </small>
              <strong>{nextStop?.title || "Take another look around"}</strong>
            </span>
            <ArrowUpRight size={17} />
          </button>
        )}
        <span className="world-place">
          10.82° N, 106.63° E <span>·</span> HO CHI MINH CITY
        </span>
      </div>
      {intro && (
        <div className="world-mobile-start">
          <button
            className="world-primary"
            disabled={status !== "ready"}
            onClick={startExploring}
          >
            Let’s explore <ArrowRight size={18} />
          </button>
          <span>Five places. Your own pace.</span>
        </div>
      )}
      <div className="world-location">
        <span className="location-dot" /> {near ? near.title : "MINH’S WORLD"}{" "}
        <small>EXPLORE / 01</small>
      </div>
      <button
        className="world-minimap"
        aria-label={`Open campus map, ${progress.visited.length} of 5 places discovered`}
        onClick={() => openPanel("map")}
      >
        <span className="minimap-heading">
          <Compass size={14} />
          <span className="map-heading-full">FIELD MAP</span>
          <span className="map-heading-compact">Map</span>
          <ArrowUpRight size={15} />
        </span>
        <span className="minimap-plan" aria-hidden="true">
          <span className="map-road map-road-main" />
          <span className="map-road map-road-top" />
          <span className="map-road map-road-bottom" />
          <span className="map-road map-road-left" />
          <span className="map-road map-road-right" />
          {stops.map((s) => (
            <span
              key={s.id}
              className={`map-stop ${
                progress.visited.includes(s.id) ? "visited" : ""
              }`}
              style={{
                left: `${((s.x + 30) / 60) * 100}%`,
                top: `${((s.z + 30) / 60) * 100}%`,
                background: s.color,
              }}
            >
              {progress.visited.includes(s.id) ? <Check size={10} /> : s.number}
            </span>
          ))}
          <span
            className="map-car"
            style={{
              left: `${((car.x + 30) / 60) * 100}%`,
              top: `${((car.z + 30) / 60) * 100}%`,
              transform: `translate(-50%,-50%) rotate(${
                (-car.heading * 180) / Math.PI + 180
              }deg)`,
            }}
          >
            <Navigation size={12} fill="currentColor" />
          </span>
        </span>
        <span className="minimap-caption">
          <strong>{progress.visited.length} / 5</strong>
          <span> places discovered</span>
        </span>
      </button>
      {status !== "failed" && (
        <div className="world-startup" aria-hidden={status !== "loading"}>
          <div className="startup-content" role="status" aria-live="polite">
            <div className="startup-village" aria-hidden="true">
              <span className="startup-orbit" />
              <StopIllustration
                id="rental"
                className="startup-art startup-art-left"
              />
              <StopIllustration
                id="commerce"
                className="startup-art startup-art-center"
              />
              <StopIllustration
                id="experience"
                className="startup-art startup-art-right"
              />
            </div>
            <span className="startup-eyebrow">
              A SMALL WORLD, BUILT BY MINH
            </span>
            <h2>
              A little world.
              <br />
              <em>Coming to life.</em>
            </h2>
            <p>Getting the roads ready for your next discovery.</p>
            <div className="startup-track" aria-hidden="true">
              <span />
            </div>
            <span className="startup-caption">PREPARING YOUR RIDE</span>
          </div>
          <span className="startup-footnote">FIVE PLACES. YOUR OWN PACE.</span>
        </div>
      )}
      {status === "failed" && (
        <div className="world-status-card">
          <Compass size={32} />
          <h2>Let’s take another route.</h2>
          <p>
            The 3D world isn’t available in this browser.
            <br />
            All projects and experience are ready to explore.
          </p>
          <Link className="world-primary" href="/overview/">
            Open the portfolio <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
      {near && !panel && !paused && !entering && status === "ready" && (
        <button
          key={near.id}
          className="world-stop-prompt"
          onClick={() => enterStop.current(near.id)}
        >
          <span className="stop-key">E</span>
          <span>
            <small>YOU’VE ARRIVED AT</small>
            <strong>{near.title}</strong>
          </span>
          <span className="stop-explore">
            Explore <ArrowUpRight size={17} />
          </span>
        </button>
      )}
      {paused && !panel && (
        <div className="world-pause-panel">
          <Pause size={24} />
          <h2>A little pit stop.</h2>
          <button className="world-primary" onClick={() => setPaused(false)}>
            Keep exploring <Play size={16} />
          </button>
        </div>
      )}
      {toast && !entering && (
        <div className="achievement-toast" key={toast} role="status">
          <Trophy size={24} />
          <div>
            <span>ACHIEVEMENT UNLOCKED</span>
            <strong>{toast}</strong>
          </div>
        </div>
      )}
      <footer className="world-footer">
        <div className="keyboard-hint">
          <span className="key-group">
            <kbd>W</kbd>
            <span>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
            </span>
          </span>
          <div>
            TAKE THE WHEEL<small>or arrow keys to drive</small>
          </div>
          <span className="keyboard-divider" />
          <span className="brake-hint">
            <kbd>SPACE</kbd> brake
          </span>
        </div>
        <div className="world-trip">
          <span>
            <Package size={15} />
            <strong className="packet-count" key={progress.collected.length}>
              {progress.collected.length}
            </strong>{" "}
            / 12 packets
          </span>
          <span className="trip-distance">
            {Math.floor(progress.distance)} m explored
          </span>
        </div>
        <div className="world-utility">
          <button
            aria-label={paused ? "Resume driving" : "Pause driving"}
            onClick={() => setPaused(!paused)}
            disabled={status !== "ready" || !!entering}
          >
            {paused ? <Play size={17} /> : <Pause size={17} />}
          </button>
          <button
            aria-label="Respawn car at starting point"
            onClick={() => {
              world.current?.respawn();
              setPaused(false);
            }}
            disabled={status !== "ready" || !!entering}
          >
            <RotateCcw size={17} />
          </button>
          <button aria-label="How to play" onClick={() => openPanel("help")}>
            <HelpCircle size={18} />
          </button>
        </div>
      </footer>
      <div className="touch-drive" aria-label="Touch driving controls">
        {(
          [
            { key: "forward", icon: <ArrowUp />, name: "Accelerate" },
            { key: "left", icon: <ArrowLeft />, name: "Steer left" },
            { key: "reverse", icon: <ArrowDown />, name: "Reverse" },
            { key: "right", icon: <ArrowRight />, name: "Steer right" },
          ] as const
        ).map((b) => (
          <button
            key={b.key}
            className={`touch-${b.key}`}
            aria-label={b.name}
            disabled={!!panel || !!entering || paused || status !== "ready"}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              hold(b.key, true);
            }}
            onPointerUp={() => hold(b.key, false)}
            onPointerCancel={() => hold(b.key, false)}
            onLostPointerCapture={() => hold(b.key, false)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                hold(b.key, true);
              }
            }}
            onKeyUp={() => hold(b.key, false)}
            onBlur={() => hold(b.key, false)}
          >
            {b.icon}
          </button>
        ))}
      </div>
      {arriving && (
        <div className="arrival-sequence" aria-live="polite">
          <div className="cinema-bar cinema-bar-top" />
          <div className="arrival-title">
            <span className="arrival-kicker">
              DESTINATION {arriving.number} / 05
            </span>
            <h2>{arriving.title}</h2>
            <p>{arriving.subtitle}</p>
            <span className="arrival-progress" />
          </div>
          <button
            ref={arrivalSkip}
            className="arrival-skip"
            onClick={() => world.current?.finishEntry()}
          >
            Enter now <ArrowRight size={14} />
          </button>
          <div className="cinema-bar cinema-bar-bottom" />
        </div>
      )}
      <Dialog
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) closePanel();
        }}
      >
        <DialogContent
          className={`world-dialog ${active ? "stop-dialog" : ""}`}
          style={
            { "--stop-accent": active?.color || "#7e9a6e" } as CSSProperties
          }
          onEscapeKeyDown={(event) => {
            event.preventDefault();
            closePanel();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const previous = opener.current;
            if (
              previous?.isConnected &&
              previous !== document.body &&
              !previous.closest(".world-stop-prompt")
            )
              previous.focus();
            else container.current?.querySelector("canvas")?.focus();
          }}
        >
          <div className="world-dialog-scroll">
            <div className="dialog-topline">
              <span>
                {active
                  ? `STOP ${active.number} / ${active.label}`
                  : displayPanel === "map"
                    ? "YOUR FIELD GUIDE"
                    : displayPanel === "help"
                      ? "READY, SET, EXPLORE"
                      : "A FEW LITTLE MILESTONES"}
              </span>
              <span>MINH’S WORLD</span>
            </div>
            <div
              className={`world-dialog-masthead ${
                active ? "has-illustration" : ""
              }`}
            >
              <div>
                <DialogTitle className="world-dialog-title">
                  {active?.title ||
                    (displayPanel === "map"
                      ? "Pick your next stop."
                      : displayPanel === "help"
                        ? "Make yourself at home."
                        : "A good day for exploring.")}
                </DialogTitle>
                <DialogDescription className="world-dialog-description">
                  {active?.subtitle ||
                    (displayPanel === "map"
                      ? "Drive there yourself, or hop straight to a destination."
                      : displayPanel === "help"
                        ? "There’s no timer. Just a little world to get to know me."
                        : "Your discoveries are saved in this browser. Keep driving to find them all.")}
                </DialogDescription>
              </div>
              {active && (
                <StopIllustration
                  id={active.id}
                  className="stop-masthead-art"
                />
              )}
            </div>
            {displayPanel === "map" && (
              <div className="world-stop-list">
                {stops.map((s) => (
                  <button
                    key={s.id}
                    className={
                      progress.visited.includes(s.id) ? "is-discovered" : ""
                    }
                    style={{ "--card-accent": s.color } as CSSProperties}
                    disabled={status !== "ready"}
                    onClick={() => travel(s.id)}
                  >
                    <StopIllustration id={s.id} className="stop-card-art" />
                    <div className="stop-card-copy">
                      <span className="stop-card-number">
                        STOP {s.number} <span> / {s.label}</span>
                      </span>
                      <strong>{s.title}</strong>
                      <small>{s.subtitle}</small>
                      <span className="stop-card-status">
                        {progress.visited.includes(s.id) ? (
                          <>
                            <Check size={12} /> Discovered
                          </>
                        ) : (
                          <>
                            Let’s go <ArrowRight size={12} />
                          </>
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {displayPanel === "achievements" && (
              <>
                <div className="explorer-pass">
                  <span className="explorer-pass-badge">
                    <Trophy size={30} strokeWidth={1.5} />
                  </span>
                  <div>
                    <span>YOUR EXPLORER PASS</span>
                    <strong>
                      {count === achievements.length
                        ? "Every corner. Every story."
                        : "Good things take a little curiosity."}
                    </strong>
                    <div
                      className="explorer-pass-stamps"
                      aria-label={`${count} of 5 achievements unlocked`}
                    >
                      {achievements.map((a) => (
                        <span
                          key={a.id}
                          className={a.goal(progress) ? "is-earned" : ""}
                        >
                          {a.goal(progress) ? <Check size={12} /> : "·"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="explorer-pass-count">
                    {count}
                    <small>/ 05</small>
                  </span>
                </div>
                <div className="achievement-list">
                  {achievements.map((a) => (
                    <div
                      className={a.goal(progress) ? "unlocked" : ""}
                      key={a.id}
                    >
                      <span>
                        {a.goal(progress) ? (
                          <Trophy size={22} />
                        ) : (
                          <LockKeyhole size={20} />
                        )}
                      </span>
                      <div>
                        <h3>{a.title}</h3>
                        <p>{a.description}</p>
                        <progress
                          className="achievement-meter"
                          max={1}
                          value={
                            a.id === "hello"
                              ? Math.min(progress.distance / 10, 1)
                              : a.id === "connection"
                                ? Math.min(progress.visited.length, 1)
                                : a.id === "tour"
                                  ? progress.visited.length / 5
                                  : a.id === "packets"
                                    ? progress.collected.length / 12
                                    : Math.min(progress.distance / 500, 1)
                          }
                          aria-label={`${a.title} progress`}
                        />
                      </div>
                      {a.goal(progress) && <Check size={17} />}
                    </div>
                  ))}
                  <div className="achievement-progress">
                    <span>{progress.visited.length}/5 stops</span>
                    <span>{progress.collected.length}/12 packets</span>
                    <span>{Math.floor(progress.distance)}/500 m</span>
                  </div>
                </div>
              </>
            )}
            {displayPanel === "help" && (
              <div className="world-help">
                <div>
                  <kbd>W A S D</kbd>
                  <p>
                    Drive and steer. Arrow keys work too.
                    <br />
                    On a phone, hold the on-screen arrows.
                  </p>
                </div>
                <div>
                  <kbd>SPACE</kbd>
                  <p>Brake. Reverse with S or the down arrow.</p>
                </div>
                <div>
                  <kbd>E / ENTER</kbd>
                  <p>
                    Explore a stop when you’re parked inside its colored ring.
                    You can also tap the arrival card.
                  </p>
                </div>
                <div>
                  <kbd>R</kbd>
                  <p>Back to the starting point if you need a fresh start.</p>
                </div>
                <p>
                  Golden packets unlock a collector achievement. The map lets
                  you jump between stops. Prefer a quick read?{" "}
                  <Link href="/overview/">
                    The full portfolio is right here.
                  </Link>
                </p>
              </div>
            )}
            {active && <StopContent id={active.id} />}
            {active && (
              <button
                className="world-primary continue-driving"
                onClick={closePanel}
              >
                Back to the road <ArrowRight size={16} />
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
function StopContent({ id }: { id: StopId }) {
  if (id === "commerce")
    return (
      <div className="stop-content">
        <span className="stop-category">PERSONAL PROJECT</span>
        <h3>Commerce, decoupled.</h3>
        <p>
          A distributed e-commerce backend built with Java and Spring Boot.
          Fourteen services connect through Kafka, with isolated databases and
          explicit domain boundaries.
        </p>
        <div className="stop-metrics">
          <div>
            <strong>14</strong>
            <span>microservices</span>
          </div>
          <div>
            <strong>23</strong>
            <span>Maven modules</span>
          </div>
          <div>
            <strong>8</strong>
            <span>shared libraries</span>
          </div>
        </div>
        <ul>
          <li>Choreography sagas and two-phase inventory reservation.</li>
          <li>Transactional outbox for reliable event publishing.</li>
          <li>
            OAuth2/OIDC with Keycloak, Redis rate limiting, and Elasticsearch
            search.
          </li>
        </ul>
        <a
          className="world-primary"
          href="https://github.com/tonminhce/petproject"
          target="_blank"
          rel="noreferrer"
        >
          Explore on GitHub <Github size={17} />
        </a>
      </div>
    );
  if (id === "experience")
    return (
      <div className="stop-content">
        <span className="stop-category">PROFESSIONAL EXPERIENCE</span>
        {experience.map((job) => (
          <div className="stop-job" key={job.company}>
            <span className="world-eyebrow">{job.period}</span>
            <h3>{job.company}</h3>
            <p>{job.role}</p>
            {job.projects.map((p) => (
              <ExperienceDisclosure
                key={p.name}
                name={p.name}
                stack={p.stack}
                defaultOpen={p.name === "AI-Driven Platform"}
              >
                <p>{p.description}</p>
                <ul>
                  {p.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </ExperienceDisclosure>
            ))}
          </div>
        ))}
      </div>
    );
  if (id === "rental")
    return (
      <div className="stop-content">
        <span className="stop-category">
          PERSONAL PROJECT · NOV 2024 — JAN 2025
        </span>
        <h3>From listings to insights.</h3>
        <p>
          A rental-data pipeline collecting ~100,000 property records across
          three major Vietnamese rental sites.
        </p>
        <ul>
          <li>
            Requests with a thread pool for public APIs, Scrapy for HTML, and
            Selenium for JavaScript-rendered sites.
          </li>
          <li>
            A Random Forest price model trained on 8 location and size features.
          </li>
          <li>A Flask endpoint delivering price estimates to the frontend.</li>
        </ul>
        <div className="world-tags">
          <span>Python</span>
          <span>Scrapy</span>
          <span>Selenium</span>
          <span>Flask</span>
        </div>
        <a
          className="world-primary"
          href="https://github.com/tonminhce/rental-system"
          target="_blank"
          rel="noreferrer"
        >
          Explore on GitHub <Github size={17} />
        </a>
      </div>
    );
  if (id === "about")
    return (
      <div className="stop-content">
        <span className="stop-category">THE PERSON BEHIND THE WHEEL</span>
        <h3>Hi, I’m Nguyen Ton Minh.</h3>
        <p>
          I’m a software engineer in Ho Chi Minh City, focused on Java, Go, and
          the backend systems that keep products working. I enjoy digging into
          concurrency, recovery, and data integrity.
        </p>
        <h4>Education</h4>
        <p>
          Bachelor of Engineering in Computer Engineering
          <br />
          <strong>Ho Chi Minh City University of Technology</strong>
          <br />
          (Bach Khoa University) · Aug 2020 — Nov 2024
        </p>
        <h4>Always learning</h4>
        {certifications.map((cert) => (
          <p className="stop-cert" key={cert.name}>
            <strong>{cert.name}</strong>
            <small>
              {cert.detail} · {cert.date}
            </small>
          </p>
        ))}
        <Link className="world-primary" href="/resume/">
          View my résumé <ArrowUpRight size={17} />
        </Link>
      </div>
    );
  return (
    <div className="stop-content">
      <span className="stop-category">LET’S BUILD SOMETHING GOOD</span>
      <h3>You’ve reached the right place.</h3>
      <p>
        Want to talk about backend engineering, an interesting project, or
        working together? Say hello.
      </p>
      <div className="stop-email-actions">
        <a className="world-primary" href={`mailto:${profile.email}`}>
          <Mail size={17} />
          {profile.email}
        </a>
        <CopyEmail />
      </div>
      <div className="contact-stop-links">
        <a href={profile.github} target="_blank" rel="noreferrer">
          <Github size={18} /> GitHub <ArrowUpRight size={14} />
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer">
          <Linkedin size={18} /> LinkedIn <ArrowUpRight size={14} />
        </a>
      </div>
      <p className="world-signoff">
        Thanks for taking the scenic route.
        <br />— Minh
      </p>
    </div>
  );
}
