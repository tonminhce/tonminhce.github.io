import Link from "next/link";
import type { Metadata } from "next";
import { PrintResume } from "@/components/print-resume";
import {
  profile,
  experience,
  certifications,
  skillGroups,
} from "@/data/portfolio";
export const metadata: Metadata = {
  title: "Résumé — Nguyen Ton Minh",
  alternates: { canonical: "/resume/" },
};
export default function Resume() {
  return (
    <main className="resume-page">
      <nav className="resume-nav" aria-label="Résumé navigation">
        <Link href="/">← Back to portfolio</Link>
        <PrintResume />
      </nav>
      <h1>{profile.name}</h1>
      <p>
        Software Engineer · Java, Go & Backend Systems · Ho Chi Minh City,
        Vietnam
      </p>
      <div className="resume-contacts">
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <a href="tel:+84707745461">{profile.phone}</a>
        <a href="https://tonminhce.github.io">tonminhce.github.io</a>
        <a href={profile.github}>github.com/tonminhce</a>
        <a href={profile.linkedin}>linkedin.com/in/nguyen-ton-minh</a>
      </div>
      <h2>Professional experience</h2>
      {experience.map((job) => (
        <article key={job.company}>
          <div className="resume-job-heading">
            <h3>{job.company}</h3>
            <span>{job.period}</span>
          </div>
          <p>{job.role} · Ho Chi Minh City, Vietnam</p>
          {job.projects.map((project) => (
            <section key={project.name}>
              <h4>
                {project.name} · {project.stack}
              </h4>
              <p>{project.description}</p>
              <ul>
                {project.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </article>
      ))}
      <h2>Personal projects</h2>
      <h3>Petproject — Distributed e-commerce platform</h3>
      <p>Java · Spring Boot · Kafka · PostgreSQL · Redis</p>
      <ul>
        <li>
          14 backend microservices and 8 shared platform libraries, organized in
          a 23-module Maven reactor.
        </li>
        <li>
          Domain-driven design, database-per-service isolation, choreography
          sagas, transactional outbox, and OAuth2/OIDC through Keycloak.
        </li>
      </ul>
      <p>
        <a href="https://github.com/tonminhce/petproject">
          github.com/tonminhce/petproject
        </a>
      </p>
      <div className="resume-job-heading">
        <h3>Rental System</h3>
        <span>Nov 2024 — Jan 2025</span>
      </div>
      <p>Python · Scrapy · Selenium · Flask</p>
      <ul>
        <li>
          Built multi-strategy crawlers for 3 Vietnamese rental sites using
          Requests with a thread pool, Scrapy, and Selenium; collected ~100k
          property records.
        </li>
        <li>
          Trained a Random Forest price-prediction model on 8 location/size
          features and served it through a Flask endpoint consumed by the
          frontend price-estimation hook.
        </li>
      </ul>
      <h2>Education</h2>
      <h3>Ho Chi Minh City University of Technology (Bach Khoa University)</h3>
      <p>
        Bachelor of Engineering in Computer Engineering · Aug 2020 — Nov 2024
        <br />
        Ho Chi Minh City, Vietnam
      </p>
      <h2>Skills</h2>
      {skillGroups.map((group) => (
        <p key={group.name}>
          <strong>{group.name}:</strong> {group.skills.join(", ")}
        </p>
      ))}
      <h2>Certifications</h2>
      {certifications.map((cert) => (
        <p key={cert.name}>
          <strong>{cert.name}</strong> · {cert.detail} · {cert.date}
        </p>
      ))}
    </main>
  );
}
