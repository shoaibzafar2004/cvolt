"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useResumeStore } from "@/store/resumeStore";
import ClientOnlyTemplate from "@/components/resume-templates/ClientOnlyTemplate";
import ThemePicker from "@/components/templates/ThemePicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { TEMPLATE_THEMES } from "@/lib/templates";
import { BUILD_STEPS } from "@/lib/build-steps";
import type { Template, ResumeData } from "@/types";

const PLACEHOLDER: ResumeData = {
  personalInfo: {
    name: "Alex Johnson",
    jobTitle: "Senior Software Engineer",
    email: "alex@example.com",
    phone: "+1 555 000 1234",
    location: "San Francisco, CA",
    linkedIn: "linkedin.com/in/alexj",
    github: "github.com/alexj",
    website: "alexjohnson.dev",
  },
  sections: [
    {
      id: "1",
      type: "work",
      displayOrder: 0,
      content: {
        company: "Acme Corp",
        role: "Senior Software Engineer",
        startDate: "2021-06",
        current: true,
        bullets: [
          "Led migration from monolith to microservices, cutting deploy time by 60%",
          "Reduced API latency by 40% through query optimization and caching layers",
          "Mentored 3 junior engineers, conducting weekly code reviews and 1-on-1s",
          "Architected real-time notification system handling 500k events/day",
        ],
      },
    },
    {
      id: "4",
      type: "work",
      displayOrder: 1,
      content: {
        company: "Startup Inc",
        role: "Software Engineer",
        startDate: "2019-03",
        endDate: "2021-05",
        current: false,
        bullets: [
          "Built internal analytics dashboard adopted by all 12 product teams, saving 5 hrs/week per team",
          "Integrated Stripe and PayPal payment APIs, enabling $2M+ in annual transactions",
          "Reduced front-end bundle size by 35% through code splitting and lazy loading",
        ],
      },
    },
    {
      id: "6",
      type: "work",
      displayOrder: 2,
      content: {
        company: "Freelance",
        role: "Junior Developer",
        startDate: "2017-06",
        endDate: "2019-02",
        current: false,
        bullets: [
          "Delivered 8 client websites using React and Next.js on time and within budget",
          "Built a custom CMS for a media outlet serving 50k monthly readers",
        ],
      },
    },
    {
      id: "8",
      type: "work",
      displayOrder: 3,
      content: {
        company: "TechCorp Global",
        role: "Frontend Developer",
        startDate: "2015-08",
        endDate: "2017-05",
        current: false,
        bullets: [
          "Rebuilt customer portal in React, improving satisfaction scores by 28%",
          "Collaborated with UX team to implement accessible, WCAG 2.1-compliant components",
          "Reduced page load time from 6s to 1.8s through lazy loading and CDN optimization",
        ],
      },
    },
    {
      id: "9",
      type: "work",
      displayOrder: 4,
      content: {
        company: "Digital Agency Co",
        role: "Web Developer Intern",
        startDate: "2014-06",
        endDate: "2015-07",
        current: false,
        bullets: [
          "Developed landing pages for 15+ marketing campaigns with average 4.2% conversion rate",
          "Maintained and improved WordPress sites for 20 client accounts",
        ],
      },
    },
    {
      id: "2",
      type: "education",
      displayOrder: 5,
      content: {
        institution: "MIT",
        degree: "Bachelor of Science",
        field: "Computer Science",
        startDate: "2013-09",
        endDate: "2017-05",
        gpa: "3.8",
      },
    },
    {
      id: "10",
      type: "education",
      displayOrder: 5,
      content: {
        institution: "Stanford University",
        degree: "Master of Science",
        field: "Software Engineering",
        startDate: "2017-09",
        endDate: "2019-06",
        gpa: "3.9",
      },
    },
    {
      id: "11",
      type: "education",
      displayOrder: 5,
      content: {
        institution: "Coursera / Google",
        degree: "Professional Certificate",
        field: "Cloud Architecture",
        startDate: "2022-01",
        endDate: "2022-06",
      },
    },
    {
      id: "3",
      type: "skills",
      displayOrder: 6,
      content: {
        skills: [
          { name: "TypeScript", level: "Expert" },
          { name: "React", level: "Expert" },
          { name: "Node.js", level: "Advanced" },
          { name: "PostgreSQL", level: "Advanced" },
          { name: "AWS", level: "Advanced" },
          { name: "Docker", level: "Intermediate" },
          { name: "GraphQL", level: "Intermediate" },
          { name: "Redis", level: "Intermediate" },
        ],
      },
    },
    {
      id: "12",
      type: "projects",
      displayOrder: 6,
      content: [
        {
          name: "DevFlow — CI/CD Dashboard",
          kind: "project",
          role: "Creator",
          description:
            "Real-time pipeline monitoring tool for engineering teams.",
          url: "https://github.com/alexj/devflow",
          startDate: "Mar 2023",
          current: true,
          techStack: ["Next.js", "WebSockets", "PostgreSQL"],
          bullets: [
            "Handles 10k concurrent users with sub-second pipeline updates",
            "Reduced mean time to detect failures from 12 min to 90 sec",
          ],
        },
        {
          name: "vercel/next.js",
          kind: "contribution",
          role: "Contributor",
          description: "React framework for production web apps.",
          url: "https://github.com/vercel/next.js/pulls?q=author:alexj",
          startDate: "Jan 2024",
          endDate: "Jun 2024",
          current: false,
          techStack: ["TypeScript", "Rust"],
          bullets: [
            "Fixed a caching bug in the App Router affecting ISR revalidation",
            "Added tests and docs for the new image optimization config",
          ],
        },
      ],
    },
    {
      id: "7",
      type: "certifications",
      displayOrder: 7,
      content: [
        {
          name: "AWS Certified Solutions Architect",
          issuer: "Amazon Web Services",
          date: "2023-04",
          url: "https://www.credly.com/badges/aws-solutions-architect",
          skills: ["AWS", "Cloud architecture", "IAM"],
        },
        {
          name: "Professional Scrum Master I",
          issuer: "Scrum.org",
          date: "2022-01",
        },
      ],
    },
    {
      id: "5",
      type: "languages",
      displayOrder: 8,
      content: [
        { language: "English", proficiency: "Native" },
        { language: "Spanish", proficiency: "Intermediate" },
      ],
    },
  ],
};

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
// Zoom is the actual scale of the A4 page (1 = 100% = real size).
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 1.5;
const ZOOM_STEP = 0.1;
// Used for the server render and the first client render, so they match (no hydration
// mismatch); replaced by the measured fit as soon as the preview panel is laid out.
const DEFAULT_FIT = 0.75;
const HEADER_H = 64; // site navbar
const TOOLBAR_H = 52; // back button + zoom controls, incl. gap

function clampZoom(z: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100));
}

export default function TemplatePreview({ template }: { template: Template }) {
  const store = useResumeStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(DEFAULT_FIT);
  const [measured, setMeasured] = useState(false);
  // null = follow the fitted size (re-fits when the window resizes)
  const [zoom, setZoom] = useState<number | null>(null);

  // Fit the whole page into the preview panel: width from the panel itself, height from
  // the viewport (the panel's own height depends on the zoomed page, so it can't be used).
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const measure = () => {
      const cs = getComputedStyle(panel);
      const availW =
        panel.clientWidth -
        parseFloat(cs.paddingLeft) -
        parseFloat(cs.paddingRight);
      const availH =
        window.innerHeight -
        HEADER_H -
        TOOLBAR_H -
        parseFloat(cs.paddingTop) -
        parseFloat(cs.paddingBottom);
      setFitScale(clampZoom(Math.min(availW / A4_WIDTH, availH / A4_HEIGHT)));
      setMeasured(true);
    };
    // ResizeObserver calls back once right after observe(), so no direct call is needed.
    const ro = new ResizeObserver(measure);
    ro.observe(panel);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const themes = TEMPLATE_THEMES[template.slug] ?? [];

  const hasData = !!store.personalInfo.name;
  const previewData: ResumeData = hasData
    ? { personalInfo: store.personalInfo, sections: store.sections }
    : PLACEHOLDER;

  const scale = zoom ?? fitScale;
  const percent = Math.round(scale * 100);

  return (
    <div className="flex flex-col lg:h-[calc(100vh-64px)] lg:flex-row">
      {/* Left — rendered resume */}
      <div
        ref={panelRef}
        className="flex flex-col items-center gap-4 bg-muted/30 p-4 sm:p-8 lg:flex-1 lg:overflow-auto"
      >
        {/* Toolbar: back to gallery · zoom controls */}
        <div className="flex w-full shrink-0 items-center justify-between gap-2 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 justify-self-start rounded-full border bg-background px-3.5 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">All templates</span>
            <span className="sm:hidden">Back</span>
          </Link>
          {/* Zoom controls */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg border bg-background px-2 py-1.5 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              aria-label="Zoom out"
              onClick={() => setZoom(clampZoom(scale - ZOOM_STEP))}
              disabled={scale <= ZOOM_MIN}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <input
              type="range"
              aria-label="Zoom"
              min={ZOOM_MIN * 100}
              max={ZOOM_MAX * 100}
              step={1}
              value={percent}
              onChange={(e) => setZoom(clampZoom(Number(e.target.value) / 100))}
              className="h-1.5 w-20 cursor-pointer accent-primary sm:w-28"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              aria-label="Zoom in"
              onClick={() => setZoom(clampZoom(scale + ZOOM_STEP))}
              disabled={scale >= ZOOM_MAX}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center text-xs font-medium text-muted-foreground tabular-nums">
              {percent}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              aria-label="Fit page to screen"
              onClick={() => setZoom(null)}
              disabled={zoom === null}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Fit</span>
            </Button>
          </div>
        </div>

        {/* Scaled resume — zoom affects layout so no blank space below.
            Overlay div sits on top of template (pointer-events:none) to draw dotted page-break lines. */}
        <div
          style={{
            flexShrink: 0,
            position: "relative",
            visibility: measured ? "visible" : "hidden",
          }}
        >
          <div
            style={{
              zoom: scale,
              width: A4_WIDTH,
              boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
            }}
          >
            <ClientOnlyTemplate slug={template.slug} data={previewData} />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage: `radial-gradient(circle at 50% calc(100% - 1px), rgba(107,114,128,0.8) 1.5px, transparent 1.5px)`,
              backgroundSize: `8px ${A4_HEIGHT * scale}px`,
              backgroundRepeat: "repeat",
            }}
          />
        </div>
      </div>

      {/* Right — info + CTA */}
      <div className="flex w-full shrink-0 flex-col gap-6 border-t bg-card p-6 sm:p-8 lg:w-80 lg:overflow-auto lg:border-t-0 lg:border-l">
        <div className="space-y-2">
          <Badge variant="secondary" className="capitalize">
            {template.category}
          </Badge>
          <h1 className="text-2xl font-bold">{template.name}</h1>
          <p className="text-sm text-muted-foreground">
            Professional resume template. Download as a pixel-perfect PDF
            instantly after purchase.
          </p>
        </div>

        {themes.length > 0 && <ThemePicker themes={themes} />}

        <div className="space-y-1">
          <p className="text-3xl font-bold">$1.50</p>
          <p className="text-xs text-muted-foreground">
            One-time payment · 30-day re-download
          </p>
        </div>

        {hasData ? (
          <Link
            href={`/checkout?templateId=${template.id}&slug=${template.slug}&name=${encodeURIComponent(template.name)}`}
            className="w-full rounded-lg bg-primary py-3 text-center font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Use this template
          </Link>
        ) : (
          <div className="space-y-3">
            <Link
              href={`/build?returnTo=/templates/${template.slug}`}
              className="block w-full rounded-lg bg-primary py-3 text-center font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Fill in your resume first
            </Link>
            <p className="text-center text-xs text-muted-foreground">
              You need your resume details before purchasing.
            </p>
          </div>
        )}

        {hasData && (
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Edit your resume
            </p>
            <div className="grid grid-cols-2 gap-2">
              {BUILD_STEPS.map(({ label, step, icon: Icon }) => (
                <Link
                  key={step}
                  href={`/build?step=${step}&returnTo=/templates/${template.slug}`}
                  className={[
                    "flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-center text-xs leading-tight text-foreground transition-colors hover:bg-muted",
                    // Odd count: let the last button span the full row
                    step === BUILD_STEPS.length && BUILD_STEPS.length % 2 === 1
                      ? "col-span-2"
                      : "",
                  ].join(" ")}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {!hasData && (
          <p className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            Showing sample data. Fill in your details above to preview your real
            resume.
          </p>
        )}
      </div>
    </div>
  );
}
