import { describe, expect, it } from "vitest";
import {
  dateRange,
  displayUrl,
  linkHref,
  projectMeta,
} from "@/lib/resume-format";

describe("linkHref", () => {
  it("adds https:// to bare domains", () => {
    expect(linkHref("linkedin.com/in/alex")).toBe(
      "https://linkedin.com/in/alex",
    );
  });

  it("keeps URLs that already have a scheme", () => {
    expect(linkHref("http://example.com")).toBe("http://example.com");
    expect(linkHref("https://example.com/x")).toBe("https://example.com/x");
  });

  it("builds mailto: for emails", () => {
    expect(linkHref(" alex@example.com ", "email")).toBe(
      "mailto:alex@example.com",
    );
  });

  it("builds tel: with digits and + only", () => {
    expect(linkHref("+1 (555) 010-2030", "phone")).toBe("tel:+15550102030");
  });
});

describe("display helpers", () => {
  it("displayUrl drops protocol and trailing slash", () => {
    expect(displayUrl("https://github.com/alex/")).toBe("github.com/alex");
    expect(displayUrl(undefined)).toBe("");
  });

  it("dateRange handles current, end and missing dates", () => {
    expect(dateRange("2020-01", undefined, true)).toBe("2020-01 – Present");
    expect(dateRange("2020-01", "2021-01")).toBe("2020-01 – 2021-01");
    expect(dateRange(undefined, "2021-01")).toBe("2021-01");
    expect(dateRange()).toBe("");
  });

  it("projectMeta labels contributions", () => {
    expect(projectMeta({ name: "x", bullets: [], role: "Lead" })).toBe("Lead");
    expect(
      projectMeta({
        name: "x",
        bullets: [],
        role: "Lead",
        kind: "contribution",
      }),
    ).toBe("Lead · Open-source contribution");
  });
});
