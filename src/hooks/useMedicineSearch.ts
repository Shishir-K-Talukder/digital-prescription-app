import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MedicineSuggestion {
  name: string;
  strength: string;
  generic: string;
  company: string;
  detectedType: string;
}

interface DbMedicine {
  name: string;
  strength: string;
  generic: string;
  company: string;
}

type MedicineTypeGroup = "topical" | "oralSolid" | "oralLiquid" | "injectable" | "inhaled" | "suppository" | "other";

interface FormulationHint {
  exactType: string;
  group: MedicineTypeGroup;
}

interface SearchParts {
  original: string;
  raw: string;
  rawTokens: string[];
  searchText: string;
  tokens: string[];
  brandTokens: string[];
  strengthTokens: string[];
  nameSearchTerms: string[];
  searchTerms: string[];
  formulationHint: FormulationHint | null;
}

interface RankedMedicine extends DbMedicine {
  detectedType: string;
  normalizedName: string;
  normalizedGeneric: string;
  normalizedStrength: string;
  strengthTokens: string[];
  searchableText: string;
}

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

const sanitizeQuery = (query: string) => normalizeText(query);

const tokenizeText = (value: string) => normalizeText(value).split(" ").filter(Boolean);

const detectType = (name: string, strength: string, generic = ""): string => {
  const n = name.toLowerCase();
  const s = strength.toLowerCase();
  const g = generic.toLowerCase();
  const combined = `${n} ${s} ${g}`;
  const nameTokens = tokenizeText(name);
  const genericTokens = tokenizeText(generic);
  const hasToken = (tokens: string[], ...patterns: RegExp[]) =>
    tokens.some((token) => patterns.some((pattern) => pattern.test(token)));
  const hasNameOrGenericToken = (...patterns: RegExp[]) =>
    hasToken(nameTokens, ...patterns) || hasToken(genericTokens, ...patterns);

  if (/\bcream\b/i.test(combined) || hasNameOrGenericToken(/cream$/)) return "Cream";
  if (/\bgel\b/i.test(combined) || hasNameOrGenericToken(/gel$/)) return "Gel";
  if (/\blotion\b/i.test(combined) || hasNameOrGenericToken(/lotion$/)) return "Lotion";
  if (/\bointment\b|\boint\b/i.test(combined) || hasNameOrGenericToken(/ointment$/, /oint$/)) return "Oint";
  if (/\bshampoo\b/i.test(combined)) return "Shampoo";
  if (/\bspray\b/i.test(combined)) return "Spray";
  if (/\binhaler\b|\bhaler\b/i.test(combined) || /\/puff|mcg\/dose/i.test(s)) return "Inhaler";
  if (/\bnebuli[sz]er?\b|\brespules?\b/i.test(combined)) return "Nebu";
  if (/\bsuppository\b|\bsupp\b/i.test(combined) || hasNameOrGenericToken(/supp$/, /suppo$/)) return "Supp";
  if (/\binjection\b|\binj\b/i.test(combined) || /\/vial|\/ampoule|\/prefilled|\/syringe/i.test(s)) return "Inj";
  if (/\bsuspension\b|\bsyrup\b|\bsyr\b|\bsyp\b|syrup preparation/i.test(combined) || (/\/5\s*ml|\/10\s*ml/i.test(s) && !/injection|iv|im/i.test(combined))) return "Syr";
  if (/\bdrop\b|\bdrops\b/i.test(combined) || hasNameOrGenericToken(/drop$/, /drops$/) || (/\/ml|mg\/ml/i.test(s) && !/injection|iv|im|vial/i.test(combined))) return "Drop";
  if (/topical/i.test(s) || /topical/i.test(g)) {
    if (/\blotion\b/i.test(n)) return "Lotion";
    if (/\bgel\b/i.test(n)) return "Gel";
    if (/\bointment\b|\boint\b/i.test(n)) return "Oint";
    return "Cream";
  }
  if (/sachet/i.test(combined)) return "Sachet";
  if (/\bcapsule\b|\bsoftgel\b/i.test(combined) || hasNameOrGenericToken(/caps?$/)) return "Cap";

  return "Tab";
};

const FORMULATION_QUERY_TERMS = new Set([
  "tab", "tabs", "tablet", "tablets",
  "cap", "caps", "capsule", "capsules",
  "syr", "syp", "syrup", "susp", "suspension",
  "drop", "drops",
  "cream", "gel", "lotion", "ointment", "oint",
  "shampoo", "spray",
  "inj", "injection", "vial", "amp", "ampoule", "iv", "im",
  "supp", "suppository", "suppositories",
  "inhaler", "puff", "nebu", "neb", "nebulizer", "nebuliser",
  "softgel",
]);

const STRENGTH_QUERY_TERMS = new Set([
  "mg", "mcg", "g", "gm", "kg", "ml", "l", "iu", "%", "w", "v",
]);

const splitAlphaNumericToken = (token: string) =>
  token
    .replace(/([a-z%]+)(\d)/gi, "$1 $2")
    .replace(/(\d)([a-z%]+)/gi, "$1 $2")
    .split(" ")
    .filter(Boolean);

const tokenizeStrengthText = (value: string) => tokenizeText(value).flatMap(splitAlphaNumericToken).filter(Boolean);

const isStrengthToken = (token: string) => /\d/.test(token) || STRENGTH_QUERY_TERMS.has(token);

const hasUsefulSearchTokens = (tokens: string[]) => tokens.some((token) => token.length > 1 && !isStrengthToken(token));

const prepareDbSearchTerm = (value: string) => value.trim().replace(/[%(),'\"]/g, " ").replace(/\s+/g, " ").trim();

const buildOrFilters = (fields: Array<"name" | "generic" | "strength">, terms: string[]) =>
  terms
    .flatMap((term) => {
      const safeTerm = prepareDbSearchTerm(term);
      if (!safeTerm) return [];
      return fields.map((field) => `${field}.ilike.%${safeTerm}%`);
    })
    .join(",");

const dedupeMedicines = (medicines: DbMedicine[]) => {
  const seen = new Set<string>();

  return medicines.filter((medicine) => {
    const key = `${medicine.name}__${medicine.strength}__${medicine.generic}__${medicine.company}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getTypeGroup = (type: string): MedicineTypeGroup => {
  if (["Cream", "Gel", "Lotion", "Oint", "Shampoo", "Spray"].includes(type)) return "topical";
  if (["Tab", "Cap", "Sachet"].includes(type)) return "oralSolid";
  if (["Syr", "Drop"].includes(type)) return "oralLiquid";
  if (type === "Inj") return "injectable";
  if (["Inhaler", "Nebu"].includes(type)) return "inhaled";
  if (type === "Supp") return "suppository";
  return "other";
};

const detectFormulationHint = (query: string): FormulationHint | null => {
  const raw = sanitizeQuery(query);
  if (!raw) return null;

  if (/\bointment\b|\boint\b/.test(raw)) return { exactType: "Oint", group: "topical" };
  if (/\blotion\b/.test(raw)) return { exactType: "Lotion", group: "topical" };
  if (/\bcream\b/.test(raw)) return { exactType: "Cream", group: "topical" };
  if (/\bgel\b/.test(raw)) return { exactType: "Gel", group: "topical" };
  if (/\bcapsule\b|\bcaps\b|\bcap\b|\bsoftgel\b/.test(raw)) return { exactType: "Cap", group: "oralSolid" };
  if (/\btablet\b|\btablets\b|\btab\b|\btabs\b/.test(raw)) return { exactType: "Tab", group: "oralSolid" };
  if (/\bsyrup\b|\bsuspension\b|\bsyr\b|\bsyp\b/.test(raw)) return { exactType: "Syr", group: "oralLiquid" };
  if (/\bdrop\b|\bdrops\b/.test(raw)) return { exactType: "Drop", group: "oralLiquid" };
  if (/\binjection\b|\binj\b|\bvial\b|\bamp\b|\bampoule\b/.test(raw)) return { exactType: "Inj", group: "injectable" };
  if (/\binhaler\b|\bpuff\b/.test(raw)) return { exactType: "Inhaler", group: "inhaled" };
  if (/\bnebu\b|\bneb\b|\brespules?\b|\bnebulizer\b|\bnebuliser\b/.test(raw)) return { exactType: "Nebu", group: "inhaled" };
  if (/\bsupp\b|\bsuppository\b/.test(raw)) return { exactType: "Supp", group: "suppository" };

  return null;
};

const getSearchParts = (query: string) => {
  const original = prepareDbSearchTerm(query);
  const originalTokens = original.split(" ").filter(Boolean);
  const raw = sanitizeQuery(query);
  const rawTokens = raw.split(" ").filter(Boolean);
  const filteredTokens = rawTokens.filter((token) => !FORMULATION_QUERY_TERMS.has(token));
  const tokens = hasUsefulSearchTokens(filteredTokens) ? filteredTokens : rawTokens;
  const brandTokens = tokens.filter((token) => !isStrengthToken(token));
  const searchText = tokens.join(" ");
  const strengthTokens = [...new Set(tokenizeStrengthText(raw).filter(isStrengthToken))];
  const filteredOriginalTokens = originalTokens.filter((token) => !FORMULATION_QUERY_TERMS.has(normalizeText(token)));
  const originalSearchTokens = hasUsefulSearchTokens(filteredOriginalTokens.map(normalizeText)) ? filteredOriginalTokens : originalTokens;
  const originalBrandTokens = originalSearchTokens.filter((token) => !isStrengthToken(normalizeText(token)));
  const originalBrandText = prepareDbSearchTerm(originalBrandTokens.join(" "));
  const nameSearchTerms = [...new Set([originalBrandText, ...originalBrandTokens].map(prepareDbSearchTerm).filter(Boolean))]
    .filter((term, _, terms) => term.length > 1 || terms.length === 1)
    .sort((a, b) => b.length - a.length)
    .slice(0, 5);
  const searchTerms = [...new Set([searchText, raw, ...tokens, ...rawTokens, ...nameSearchTerms.map(normalizeText)].filter(Boolean))]
    .filter((term, _, terms) => term.length > 1 || terms.length === 1)
    .sort((a, b) => b.length - a.length)
    .slice(0, 7);

  return {
    original,
    raw,
    rawTokens,
    searchText,
    tokens,
    brandTokens,
    strengthTokens,
    nameSearchTerms,
    searchTerms,
    formulationHint: detectFormulationHint(query),
  } satisfies SearchParts;
};

const buildSearchableText = (medicine: DbMedicine) => normalizeText(`${medicine.name} ${medicine.generic} ${medicine.strength}`);

const matchesTokens = (value: string, tokens: string[]) => tokens.every((token) => value.includes(token));

const toRankedMedicine = (medicine: DbMedicine): RankedMedicine => ({
  ...medicine,
  detectedType: detectType(medicine.name, medicine.strength, medicine.generic),
  normalizedName: normalizeText(medicine.name),
  normalizedGeneric: normalizeText(medicine.generic),
  normalizedStrength: normalizeText(medicine.strength),
  strengthTokens: tokenizeStrengthText(medicine.strength),
  searchableText: buildSearchableText(medicine),
});

const getFormulationPriority = (medicine: RankedMedicine, formulationHint: FormulationHint | null) => {
  if (!formulationHint) return 0;
  if (medicine.detectedType === formulationHint.exactType) return 0;
  if (getTypeGroup(medicine.detectedType) === formulationHint.group) return 1;
  return 2;
};

const getStrengthPriority = (medicine: RankedMedicine, strengthTokens: string[]) => {
  if (strengthTokens.length === 0) return 0;

  const hasExactStrengthMatch = strengthTokens.every((token) => medicine.strengthTokens.includes(token));
  if (hasExactStrengthMatch) return 0;

  const numericTokens = strengthTokens.filter((token) => /\d/.test(token));
  const hasNumericStrengthMatch = numericTokens.length > 0 && numericTokens.every((token) => medicine.strengthTokens.includes(token));
  if (hasNumericStrengthMatch) return 1;

  if (strengthTokens.some((token) => medicine.strengthTokens.includes(token))) return 2;
  return 3;
};

const getMatchRank = (medicine: RankedMedicine, parts: SearchParts) => {
  const { raw, rawTokens, searchText, tokens, brandTokens, strengthTokens } = parts;
  const brandText = brandTokens.join(" ");
  const name = medicine.normalizedName;
  const generic = medicine.normalizedGeneric;
  const searchable = medicine.searchableText;
  const hasExactStrengthMatch = strengthTokens.length > 0 && strengthTokens.every((token) => medicine.strengthTokens.includes(token));

  if (brandText && name === brandText && hasExactStrengthMatch) return 0;
  if (brandText && name === brandText) return 1;
  if (brandText && name.startsWith(brandText) && hasExactStrengthMatch) return 2;
  if (brandText && name.startsWith(brandText)) return 3;
  if (brandTokens.length > 0 && matchesTokens(name, brandTokens) && hasExactStrengthMatch) return 4;
  if (brandTokens.length > 0 && matchesTokens(name, brandTokens)) return 5;

  if (raw && name === raw) return 6;
  if (raw && generic === raw) return 7;
  if (rawTokens.length > 1 && matchesTokens(name, rawTokens)) return 8;
  if (rawTokens.length > 1 && matchesTokens(generic, rawTokens)) return 9;
  if (searchText && name === searchText) return 10;
  if (searchText && generic === searchText) return 11;
  if (searchText && name.startsWith(searchText)) return 12;
  if (searchText && generic.startsWith(searchText)) return 13;
  if (tokens.length > 1 && matchesTokens(name, tokens)) return 14;
  if (tokens.length > 1 && matchesTokens(generic, tokens)) return 15;
  if (raw && searchable.includes(raw)) return 16;
  if (searchText && searchable.includes(searchText)) return 17;
  if (tokens.length > 0 && matchesTokens(searchable, tokens)) return 18;
  return 19;
};

const filterAndSortMatches = (medicines: DbMedicine[], query: string) => {
  const parts = getSearchParts(query);
  const { raw, searchText, tokens, brandTokens, strengthTokens, formulationHint } = parts;
  const targetLength = searchText.length || raw.length;

  return medicines
    .map(toRankedMedicine)
    .filter((medicine) => {
      if (searchText && medicine.searchableText.includes(searchText)) return true;
      if (brandTokens.length > 0 && matchesTokens(medicine.normalizedName, brandTokens)) return true;
      return tokens.length > 0 && matchesTokens(medicine.searchableText, tokens);
    })
    .sort((a, b) => {
      const rankDiff = getMatchRank(a, parts) - getMatchRank(b, parts);
      if (rankDiff !== 0) return rankDiff;

      const strengthDiff = getStrengthPriority(a, strengthTokens) - getStrengthPriority(b, strengthTokens);
      if (strengthDiff !== 0) return strengthDiff;

      const formulationDiff = getFormulationPriority(a, formulationHint) - getFormulationPriority(b, formulationHint);
      if (formulationDiff !== 0) return formulationDiff;

      const aNameDistance = Math.abs(a.normalizedName.length - targetLength);
      const bNameDistance = Math.abs(b.normalizedName.length - targetLength);
      if (aNameDistance !== bNameDistance) return aNameDistance - bNameDistance;

      const aStrengthDistance = Math.abs(normalizeText(a.strength).length - targetLength);
      const bStrengthDistance = Math.abs(normalizeText(b.strength).length - targetLength);
      if (aStrengthDistance !== bStrengthDistance) return aStrengthDistance - bStrengthDistance;

      return 0;
    })
    .slice(0, 20);
};

const toSuggestion = (medicine: RankedMedicine): MedicineSuggestion => ({
  name: medicine.name,
  strength: medicine.strength,
  generic: medicine.generic,
  company: medicine.company,
  detectedType: medicine.detectedType,
});

export const __medicineSearchUtils = {
  detectType,
  filterAndSortMatches,
  getSearchParts,
};

// Fallback: load from static JSON if DB is empty
let fallbackData: DbMedicine[] | null = null;
let fallbackPromise: Promise<DbMedicine[]> | null = null;

const loadFallback = (): Promise<DbMedicine[]> => {
  if (fallbackData) return Promise.resolve(fallbackData);
  if (fallbackPromise) return fallbackPromise;
  fallbackPromise = fetch(import.meta.env.BASE_URL + "medicines.json")
    .then((r) => r.json())
    .then((data: { n: string; s: string; g: string; c: string }[]) => {
      fallbackData = data.map((m) => ({ name: m.n, strength: m.s, generic: m.g, company: m.c }));
      return fallbackData;
    })
    .catch(() => []);
  return fallbackPromise;
};

const searchFromDb = async (query: string): Promise<MedicineSuggestion[]> => {
  const { nameSearchTerms, searchTerms } = getSearchParts(query);
  if (nameSearchTerms.length === 0 && searchTerms.length === 0) return [];

  const refineMatches = (medicines: DbMedicine[]) => filterAndSortMatches(medicines, query).map(toSuggestion);
  const candidates: DbMedicine[] = [];

  const nameFilters = buildOrFilters(["name"], nameSearchTerms);
  if (nameFilters) {
    const { data: brandSeedMatches, error: brandSeedError } = await supabase
      .from("medicines")
      .select("name, strength, generic, company")
      .or(nameFilters)
      .limit(300);

    if (!brandSeedError && brandSeedMatches && brandSeedMatches.length > 0) {
      const brandSeeds = brandSeedMatches as unknown as DbMedicine[];
      candidates.push(...brandSeeds);

      const matchedBrandNames = [...new Set(brandSeeds.map((medicine) => medicine.name))].slice(0, 30);
      if (matchedBrandNames.length > 0) {
        const { data: brandVariants, error: brandVariantsError } = await supabase
          .from("medicines")
          .select("name, strength, generic, company")
          .in("name", matchedBrandNames)
          .limit(800);

        if (!brandVariantsError && brandVariants && brandVariants.length > 0) {
          candidates.push(...(brandVariants as unknown as DbMedicine[]));
        }
      }
    }
  }

  const broadFilters = buildOrFilters(["name", "generic", "strength"], [...nameSearchTerms, ...searchTerms].slice(0, 8));
  if (broadFilters) {
    const { data: broadMatches, error: broadError } = await supabase
      .from("medicines")
      .select("name, strength, generic, company")
      .or(broadFilters)
      .limit(400);

    if (!broadError && broadMatches && broadMatches.length > 0) {
      candidates.push(...(broadMatches as unknown as DbMedicine[]));
    }
  }

  const refined = refineMatches(dedupeMedicines(candidates));
  if (refined.length > 0) return refined;

  const fallback = await loadFallback();
  return refineMatches(fallback);
};

export const useMedicineSearch = (query: string) => {
  const [suggestions, setSuggestions] = useState<MedicineSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const requestId = ++requestIdRef.current;

    debounceRef.current = setTimeout(async () => {
      const results = await searchFromDb(query);
      if (requestId === requestIdRef.current) {
        setSuggestions(results);
        setLoading(false);
      }
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { suggestions, loading };
};
