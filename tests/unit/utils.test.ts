import { describe, expect, it } from "vitest";
import { shapeDbRowToResumeData, type DbResume } from "@/lib/utils";
import { personalInfoSchema } from "@/lib/schemas";

describe("shapeDbRowToResumeData", () => {
  it("maps DB rows to ResumeData sorted by display_order", () => {
    const row: DbResume = {
      personal_info: {
        name: "A",
        jobTitle: "B",
        email: "a@b.co",
        phone: "1",
        location: "X",
      },
      resume_sections: [
        {
          id: "2",
          section_type: "work",
          content: { role: "Second" } as never,
          display_order: 1,
        },
        {
          id: "1",
          section_type: "work",
          content: { role: "First" } as never,
          display_order: 0,
        },
      ],
    };
    const data = shapeDbRowToResumeData(row);
    expect(data.personalInfo.name).toBe("A");
    expect(data.sections.map((s) => s.id)).toEqual(["1", "2"]);
    expect(data.sections[0]).toMatchObject({ type: "work", displayOrder: 0 });
  });
});

describe("personalInfoSchema", () => {
  const valid = {
    name: "Alex",
    jobTitle: "Engineer",
    email: "alex@example.com",
    phone: "123",
    location: "Berlin",
  };

  it("accepts the required fields with optional links empty", () => {
    expect(
      personalInfoSchema.safeParse({ ...valid, linkedIn: "" }).success,
    ).toBe(true);
  });

  it("rejects a missing name and an invalid email", () => {
    expect(personalInfoSchema.safeParse({ ...valid, name: "" }).success).toBe(
      false,
    );
    expect(
      personalInfoSchema.safeParse({ ...valid, email: "nope" }).success,
    ).toBe(false);
  });
});
