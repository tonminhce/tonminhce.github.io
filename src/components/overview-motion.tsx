"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const MotionContext = createContext({ paused: false, toggle: () => {} });
export const useOverviewMotion = () => useContext(MotionContext);

/** Native scrolling, progressive reveals, and no permanent scroll render loop. */
export function OverviewMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPaused(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const page = root.current;
    if (!page) return;
    // Resuming motion must not replay the page's first entrance.
    const finish = () => {
      page.dataset.entered = "true";
    };
    if (paused) finish();
    const timer = window.setTimeout(finish, 1800);
    return () => window.clearTimeout(timer);
  }, [paused]);

  useEffect(() => {
    const page = root.current;
    if (!page) return;
    const targets = Array.from(
      page.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const reveal = (element: HTMLElement) => {
      element.classList.remove("reveal-pending");
      element.dataset.revealed = "true";
    };
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach(reveal);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px 120px 0px", threshold: 0 },
    );
    targets.forEach((element) => {
      // Content already on screen is never hidden after hydration.
      if (
        element.dataset.revealed ||
        element.getBoundingClientRect().top < innerHeight - 24
      ) {
        reveal(element);
      } else {
        element.classList.add("reveal-pending");
        observer.observe(element);
      }
    });
    const onFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      targets.filter((element) => element.contains(target)).forEach(reveal);
    };
    page.addEventListener("focusin", onFocus);
    return () => {
      observer.disconnect();
      page.removeEventListener("focusin", onFocus);
      targets.forEach((element) => element.classList.remove("reveal-pending"));
    };
  }, [paused]);

  useEffect(() => {
    const page = root.current;
    if (!page) return;
    const links = Array.from(
      page.querySelectorAll<HTMLAnchorElement>(".site-header nav a[href^='#']"),
    );
    const sections = links.map((link) =>
      document.getElementById(link.hash.slice(1)),
    );
    const ambient = new IntersectionObserver((entries) => {
      entries.forEach(
        (entry) =>
          ((entry.target as HTMLElement).dataset.inView = String(
            entry.isIntersecting,
          )),
      );
    });
    page
      .querySelectorAll("[data-ambient]")
      .forEach((element) => ambient.observe(element));
    const onVisibility = () => {
      page.dataset.hidden = String(document.hidden);
    };
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    let frame = 0;
    let activeSection = -2;
    let wasScrolled: boolean | undefined;
    const progressBar = page.querySelector<HTMLElement>(".reading-progress");
    let pageHeight = document.documentElement.scrollHeight;
    const update = () => {
      frame = 0;
      const progress = Math.max(
        0,
        Math.min(1, scrollY / Math.max(1, pageHeight - innerHeight)),
      );
      let current = -1;
      sections.forEach((section, index) => {
        if (
          section &&
          section.getBoundingClientRect().top <= innerHeight * 0.38
        )
          current = index;
      });
      if (progress > 0.985) current = links.length - 1;
      // Finish layout reads before writes, and only change navigation on crossing a section.
      if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
      const scrolled = scrollY > 24;
      if (wasScrolled !== scrolled) {
        page.dataset.scrolled = String(scrolled);
        wasScrolled = scrolled;
      }
      if (activeSection !== current) {
        links.forEach((link, index) => {
          if (index === current) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
        activeSection = current;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(() => {
      pageHeight = document.documentElement.scrollHeight;
      schedule();
    });
    resize.observe(page);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      ambient.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <MotionContext.Provider
      value={{ paused, toggle: () => setPaused((value) => !value) }}
    >
      <div
        className="overview-page"
        data-motion={paused ? "paused" : "running"}
        ref={root}
      >
        {children}
      </div>
    </MotionContext.Provider>
  );
}

export function MotionToggle() {
  const { paused, toggle } = useOverviewMotion();
  return (
    <button
      className="motion-toggle"
      onClick={toggle}
      aria-pressed={paused}
      aria-label={paused ? "Enable page motion" : "Pause page motion"}
      title={paused ? "Enable page motion" : "Pause page motion"}
    >
      {paused ? <Play size={13} /> : <Pause size={13} />}
      <span>Motion {paused ? "off" : "on"}</span>
    </button>
  );
}
