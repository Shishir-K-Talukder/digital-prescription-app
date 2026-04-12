import { describe, expect, it } from "vitest";
import { __medicineSearchUtils } from "@/hooks/useMedicineSearch";

const { detectType, filterAndSortMatches, getSearchParts } = __medicineSearchUtils;

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

  it("prioritizes the exact brand strength when the query includes a dose", () => {
    const results = filterAndSortMatches(
      [
        { name: "Napa", strength: "120 mg/5 ml", generic: "Paracetamol", company: "Beximco Pharmaceuticals Ltd." },
        { name: "Napa", strength: "500 mg", generic: "Paracetamol", company: "Beximco Pharmaceuticals Ltd." },
        { name: "Napa", strength: "80 mg/ml", generic: "Paracetamol", company: "Beximco Pharmaceuticals Ltd." },
      ],
      "Napa 500",
    );

    expect(results[0]?.name).toBe("Napa");
    expect(results[0]?.strength).toBe("500 mg");
  });

  it("keeps hyphenated brand names searchable without collapsing them into generic cap matches", () => {
    const parts = getSearchParts("D-Cap");
    const results = filterAndSortMatches(
      [
        { name: "Capdol", strength: "500 mg+65 mg", generic: "Paracetamol + Caffeine", company: "Beximco Pharmaceuticals Ltd." },
        { name: "D-Cap", strength: "1000 IU", generic: "Cholecalciferol [Vitamin D3]", company: "Drug International Ltd." },
        { name: "Androcap", strength: "40 mg", generic: "Testosterone Undecanoate", company: "Renata Ltd." },
      ],
      "D-Cap",
    );

    expect(parts.nameSearchTerms).toContain("D-Cap");
    expect(results[0]?.name).toBe("D-Cap");
  });
});