import { describe, expect, it } from "vitest";
import { __medicineSearchUtils } from "@/hooks/useMedicineSearch";

const { detectType, filterAndSortMatches } = __medicineSearchUtils;

describe("medicine search helpers", () => {
  it("detects formulation from the generic field when name and strength do not include it", () => {
    expect(detectType("Artigest", "100 mg", "Progesterone Micronized (Capsule)")).toBe("Cap");
    expect(detectType("A-Mycin", "3% W/V", "Erythromycin (Lotion)")).toBe("Lotion");
  });

  it("keeps topical matches ahead of oral variants when the query contains a wrong topical formulation", () => {
    const results = filterAndSortMatches(
      [
        { name: "A-Mycin", strength: "125 mg/5 ml", generic: "Erythromycin (Oral)", company: "Aristopharma Ltd." },
        { name: "A-Mycin", strength: "200 mg/5 ml", generic: "Erythromycin (Oral)", company: "Aristopharma Ltd." },
        { name: "A-Mycin", strength: "3% W/V", generic: "Erythromycin (Lotion)", company: "Aristopharma Ltd." },
      ],
      "A-Mycin cream",
    );

    expect(results[0]?.detectedType).toBe("Lotion");
    expect(results[0]?.strength).toBe("3% W/V");
  });

  it("returns capsule brands as Cap instead of Tab", () => {
    const results = filterAndSortMatches(
      [
        { name: "Artigest", strength: "100 mg", generic: "Progesterone Micronized (Capsule)", company: "Incepta Pharmaceuticals Ltd." },
        { name: "Artigest", strength: "200 mg", generic: "Progesterone Micronized (Capsule)", company: "Incepta Pharmaceuticals Ltd." },
      ],
      "Artigest cap",
    );

    expect(results[0]?.detectedType).toBe("Cap");
  });
});