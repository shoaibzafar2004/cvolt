import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getAllTemplateSlugs, getTemplate } from "@/lib/templates";
import { fullResume, minimalResume } from "../fixtures";

// Replaces the manual "render all 14 with renderToStaticMarkup" check: every
// template must render server-side (the PDF path) for full and sparse data.
const slugs = getAllTemplateSlugs();

describe("template registry", () => {
  it("has all templates", () => {
    expect(slugs.length).toBe(14);
  });

  it("throws for an unknown slug", () => {
    expect(() => getTemplate("nope")).toThrow();
  });
});

describe.each(slugs)("%s template", (slug) => {
  const Template = getTemplate(slug);

  it("renders a full resume with every section and live links", () => {
    const html = renderToStaticMarkup(<Template data={fullResume()} />);
    // Some templates style first and last name separately
    expect(html).toContain("Alex");
    expect(html).toContain("Morgan");
    expect(html).toContain("Acme Corp");
    expect(html).toContain("TU Berlin");
    expect(html).toContain("OpenThing");
    expect(html).toContain('href="mailto:alex@example.com"');
    expect(html).toContain('href="tel:+15550102030"');
    expect(html).toContain('href="https://linkedin.com/in/alex-morgan"');
    expect(html).toContain('href="https://github.com/alexmorgan/openthing"');
    expect(html).toContain('href="https://www.credly.com/badges/abc123"');
  });

  it("renders with only step-1 data", () => {
    const html = renderToStaticMarkup(<Template data={minimalResume()} />);
    expect(html).toContain("Sam");
    expect(html).toContain("Lee");
  });

  it("never nests links (invalid HTML, hydration errors)", () => {
    const html = renderToStaticMarkup(<Template data={fullResume()} />);
    let depth = 0;
    for (const tag of html.match(/<\/?a[\s>]/g) ?? []) {
      depth += tag.startsWith("</") ? -1 : 1;
      expect(depth).toBeLessThanOrEqual(1);
    }
  });

  it("uses no Tailwind classes (templates are inline-styles only)", () => {
    const html = renderToStaticMarkup(<Template data={fullResume()} />);
    expect(html).not.toMatch(/\sclass="/);
  });
});
