import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Portfolio — Nguyen Ton Minh",
  alternates: { canonical: "/overview/" },
};
import {
  ArrowUpRight,
  ArrowDown,
  Github,
  Linkedin,
  MoveUpRight,
  ArrowRight,
  Layers3,
  Terminal,
  Database,
} from "lucide-react";
import { HeroScene } from "@/components/hero-scene";
import {
  experience,
  certifications,
  skillGroups,
  profile,
} from "@/data/portfolio";

const External = ({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={className}
  >
    {children}
  </a>
);
export default function Overview() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header shell">
        <Link href="/" className="wordmark" aria-label="Ton Minh, home">
          <span className="brand-symbol">
            m<span>.</span>
          </span>
          <span>
            TON MINH<span className="wordmark-sub">SOFTWARE ENGINEER</span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#about">About</a>
          <a href="#contact" className="nav-contact">
            Let’s talk <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="short-rule" /> JAVA & BACKEND ENGINEER
            </div>
            <h1 id="hero-title">
              Behind every
              <br />
              great experience,
              <br />
              <span>a solid system.</span>
            </h1>
            <p className="hero-description">
              I’m Minh. I build reliable backends, connect complex systems, and
              make the details work at scale.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#work">
                Explore my work <ArrowDown size={17} />
              </a>
              <Link className="text-link" href="/resume/">
                View résumé <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="hero-location">
              <span>BASED IN</span> Ho Chi Minh City, Vietnam{" "}
              <span className="location-cross">✳</span>
            </div>
          </div>
          <HeroScene />
          <div className="hero-bottom">
            <span>BUILT WITH INTENT. FROM THE INSIDE OUT.</span>
            <a href="#work">
              SCROLL TO EXPLORE <ArrowDown size={14} />
            </a>
          </div>
        </section>
        <div className="stack-band">
          <div className="shell stack-inner">
            <span className="eyebrow">MY EVERYDAY TOOLKIT</span>
            <div>
              <span>Java</span>
              <i>/</i>
              <span>Spring Boot</span>
              <i>/</i>
              <span>Go</span>
              <i>/</i>
              <span>PostgreSQL</span>
              <i>/</i>
              <span>Redis</span>
              <i>/</i>
              <span>Docker</span>
            </div>
          </div>
        </div>
        <section
          className="section shell"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span className="section-number">01</span> PERSONAL PROJECTS
              </p>
              <h2 id="work-title">
                Complex problems.
                <br />
                <span className="muted">Considered solutions.</span>
              </h2>
            </div>
            <External href={profile.github} className="text-link">
              All repositories <ArrowUpRight size={17} />
            </External>
          </div>
          <article className="featured-project">
            <div className="project-copy">
              <p className="eyebrow accent">FEATURED / PERSONAL PROJECT</p>
              <h3>
                Commerce,
                <br />
                decoupled.
              </h3>
              <p className="project-subtitle">
                Petproject · Distributed e-commerce platform
              </p>
              <p>
                Fourteen services. One connected system. A Java and Spring Boot
                backend built around clear domain boundaries and event-driven
                workflows.
              </p>
              <div className="tags">
                {["Java", "Spring Boot", "Kafka", "PostgreSQL", "Redis"].map(
                  (t) => (
                    <span key={t}>{t}</span>
                  ),
                )}
              </div>
              <External
                href="https://github.com/tonminhce/petproject"
                className="button button-outline"
              >
                Explore the repository <ArrowUpRight size={17} />
              </External>
            </div>
            <div
              className="project-system"
              aria-label="Simplified overview of the commerce architecture"
            >
              <div className="system-caption">
                <span>COMMERCE / SYSTEM OVERVIEW</span>
                <Layers3 size={17} />
              </div>
              <div className="system-entry">
                <span>HTTP REQUEST</span>
                <span className="flow-line" />
                <div className="gateway">
                  API GATEWAY <span>AUTH + RATE LIMITING</span>
                </div>
              </div>
              <div className="system-services">
                <div>
                  ORDER<span>checkout</span>
                </div>
                <div>
                  INVENTORY<span>reserve / commit</span>
                </div>
                <div>
                  PAYMENT<span>capture / refund</span>
                </div>
              </div>
              <div className="event-bus">
                <span className="bus-icon">↔</span> KAFKA EVENT BACKBONE{" "}
                <span className="bus-dots">·······</span>
              </div>
              <div className="system-storage">
                <Database size={15} />
                <span>ISOLATED POSTGRESQL DATABASES</span>
              </div>
              <div className="system-stats">
                <div>
                  <strong>14</strong>
                  <span>microservices</span>
                </div>
                <div>
                  <strong>23</strong>
                  <span>Maven modules</span>
                </div>
                <div>
                  <strong>01</strong>
                  <span>event backbone</span>
                </div>
              </div>
            </div>
            <div className="project-footer">
              <span>Transactional outbox</span>
              <span>Choreography sagas</span>
              <span>OAuth2 / OIDC</span>
              <External href="https://github.com/tonminhce/petproject#1-system-landscape-architecture">
                Architecture notes <ArrowUpRight size={15} />
              </External>
            </div>
          </article>
          <div className="secondary-projects">
            <article className="project-row">
              <div className="project-index">02 /</div>
              <div>
                <p className="eyebrow">
                  PERSONAL PROJECT · NOV 2024 — JAN 2025
                </p>
                <h3>From listings to insights.</h3>
                <p>
                  A rental-data pipeline spanning three Vietnamese property
                  sites, with a Random Forest price model served through Flask.
                </p>
                <div className="tags">
                  <span>Python</span>
                  <span>Scrapy</span>
                  <span>Selenium</span>
                  <span>Flask</span>
                </div>
              </div>
              <div className="project-result">
                <strong>
                  ~100<span>k</span>
                </strong>
                <p>
                  property records
                  <br />
                  <small>Collected across 3 rental sites</small>
                </p>
                <External
                  href="https://github.com/tonminhce/rental-system"
                  className="text-link"
                >
                  View repository <ArrowUpRight size={15} />
                </External>
              </div>
            </article>
          </div>
        </section>
        <section
          className="experience-section"
          id="experience"
          aria-labelledby="experience-title"
        >
          <div className="section shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  <span className="section-number">02</span> EXPERIENCE
                </p>
                <h2 id="experience-title">Built in the real world.</h2>
              </div>
              <p className="section-note">
                From data integrity to delivery.
                <br />
                The work behind the results.
              </p>
            </div>
            {experience.map((job, i) => (
              <article
                className="experience-row"
                id={i === 0 ? "vnpt" : "kddi"}
                key={job.company}
              >
                <div className="experience-time">
                  <span
                    className={i === 0 ? "current-marker" : "past-marker"}
                  />
                  <p>{job.period}</p>
                  <span>HO CHI MINH CITY</span>
                </div>
                <div className="experience-content">
                  <div className="job-heading">
                    <h3>{job.company}</h3>
                    <p>{job.role}</p>
                  </div>
                  {job.projects.map((project) => (
                    <details
                      key={project.name}
                      open={project.name === "VNPT Green"}
                    >
                      <summary>
                        <span>
                          {project.name}
                          <small>{project.stack}</small>
                        </span>
                        <span className="expand-icon" aria-hidden="true">
                          +
                        </span>
                      </summary>
                      <div className="experience-detail">
                        <p>{project.description}</p>
                        <ul>
                          {project.points.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          className="section shell about-section"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="about-intro">
            <p className="eyebrow">
              <span className="section-number">03</span> A LITTLE ABOUT ME
            </p>
            <h2 id="about-title">
              Curious by nature.
              <br />
              <span className="muted">Engineer by practice.</span>
            </h2>
            <p>
              I’m Nguyen Ton Minh, a software engineer based in Ho Chi Minh
              City. My focus is backend development with Java and Go: the APIs,
              data flows, and infrastructure that keep a product running.
            </p>
            <p>
              I enjoy the problems beneath the surface. What happens when
              requests race? When a process fails halfway through? When a query
              needs to work just as well at 500,000 rows?
            </p>
            <div className="education">
              <span className="eyebrow">EDUCATION / 2020 — 2024</span>
              <h3>B.Eng. in Computer Engineering</h3>
              <p>
                Ho Chi Minh City University of Technology
                <br />
                (Bach Khoa University)
              </p>
            </div>
          </div>
          <div className="about-toolkit">
            <div className="toolkit-heading">
              <Terminal size={19} />
              <span className="eyebrow">TOOLS OF THE TRADE</span>
            </div>
            {skillGroups.map((group) => (
              <div className="skill-group" key={group.name}>
                <h3>{group.name}</h3>
                <div>
                  {group.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            ))}
            <div className="certifications">
              <p className="eyebrow">CONTINUING TO LEARN</p>
              {certifications.map((cert) => (
                <div key={cert.name}>
                  <span className="cert-mark">↗</span>
                  <div>
                    <h3>{cert.name}</h3>
                    <p>{cert.detail}</p>
                  </div>
                  <span className="cert-date">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          className="contact-section shell"
          id="contact"
          aria-labelledby="contact-title"
        >
          <p className="eyebrow">
            <span className="section-number">04</span> GET IN TOUCH
          </p>
          <div className="contact-heading">
            <h2 id="contact-title">
              Good systems start
              <br />
              with a <span>conversation.</span>
            </h2>
            <a
              className="contact-orb"
              href={`mailto:${profile.email}`}
              aria-label="Email Nguyen Ton Minh"
            >
              <MoveUpRight />
            </a>
          </div>
          <div className="contact-links">
            <a className="email-link" href={`mailto:${profile.email}`}>
              {profile.email} <ArrowUpRight size={20} />
            </a>
            <div>
              <External href={profile.github}>
                <Github size={17} /> GitHub <ArrowUpRight size={14} />
              </External>
              <External href={profile.linkedin}>
                <Linkedin size={17} /> LinkedIn <ArrowUpRight size={14} />
              </External>
              <Link href="/resume/">
                Résumé <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer shell">
        <span>© {new Date().getFullYear()} Nguyen Ton Minh</span>
        <span>THOUGHTFULLY ENGINEERED IN VIETNAM</span>
        <a href="#main">
          Back to top <ArrowRight size={14} className="rotate-up" />
        </a>
      </footer>
    </>
  );
}
