import { describe, expect, it } from "vitest";
import { generateImsManifest12 } from "./imsmanifest-1.2.js";

describe("generateImsManifest12", () => {
  it("includes the identifier, title, and every listed file", () => {
    const xml = generateImsManifest12({
      identifier: "trainer-123",
      title: "Смена юридического адреса клиента",
      files: ["index.html", "scenario.json", "assets/screen_1.png"],
    });

    expect(xml).toContain('identifier="trainer-123"');
    expect(xml).toContain("Смена юридического адреса клиента");
    expect(xml).toContain('href="index.html"');
    expect(xml).toContain('href="scenario.json"');
    expect(xml).toContain('href="assets/screen_1.png"');
    expect(xml).toContain('adlcp:scormtype="sco"');
  });

  it("escapes XML-unsafe characters in the title", () => {
    const xml = generateImsManifest12({
      identifier: "id",
      title: 'Test <script>alert("x")</script> & Co',
      files: [],
    });

    expect(xml).not.toContain("<script>");
    expect(xml).toContain("&lt;script&gt;");
    expect(xml).toContain("&amp;");
    expect(xml).toContain("&quot;");
  });

  it("starts with an XML declaration and has balanced manifest tags", () => {
    const xml = generateImsManifest12({ identifier: "id-1", title: "Title", files: ["index.html"] });
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect((xml.match(/<manifest[ >]/g) ?? []).length).toBe(1);
    expect((xml.match(/<\/manifest>/g) ?? []).length).toBe(1);
  });
});
