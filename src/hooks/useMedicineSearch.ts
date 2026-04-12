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
  raw: string;
  rawTokens: string[];
  searchText: string;
  tokens: string[];
  searchTerms: string[];
  formulationHint: FormulationHint | null;
}

interface RankedMedicine extends DbMedicine {
  detectedType: string;
  normalizedName: string;
  normalizedGeneric: string;
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
  const raw = sanitizeQuery(query);
  const rawTokens = raw.split(" ").filter(Boolean);
  const filteredTokens = rawTokens.filter((token) => !FORMULATION_QUERY_TERMS.has(token));
  const tokens = filteredTokens.length > 0 ? filteredTokens : rawTokens;
  const searchText = tokens.join(" ");
  const searchTerms = [...new Set([searchText, raw, ...tokens, ...rawTokens].filter(Boolean))]
    .filter((term, _, terms) => term.length > 1 || terms.length === 1)
    .sort((a, b) => b.length - a.length)
    .slice(0, 5);

  return {
    raw,
    rawTokens,
    searchText,
    tokens,
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
  searchableText: buildSearchableText(medicine),
});

const getFormulationPriority = (medicine: RankedMedicine, formulationHint: FormulationHint | null) => {
  if (!formulationHint) return 0;
  if (medicine.detectedType === formulationHint.exactType) return 0;
  if (getTypeGroup(medicine.detectedType) === formulationHint.group) return 1;
  return 2;
};

const getMatchRank = (medicine: RankedMedicine, parts: SearchParts) => {
  const { raw, rawTokens, searchText, tokens } = parts;
  const name = medicine.normalizedName;
  const generic = medicine.normalizedGeneric;
  const searchable = medicine.searchableText;

  if (raw && name === raw) return 0;
  if (raw && generic === raw) return 1;
  if (rawTokens.length > 1 && matchesTokens(name, rawTokens)) return 2;
  if (rawTokens.length > 1 && matchesTokens(generic, rawTokens)) return 3;
  if (searchText && name === searchText) return 4;
  if (searchText && generic === searchText) return 5;
  if (searchText && name.startsWith(searchText)) return 6;
  if (searchText && generic.startsWith(searchText)) return 7;
  if (tokens.length > 1 && matchesTokens(name, tokens)) return 8;
  if (tokens.length > 1 && matchesTokens(generic, tokens)) return 9;
  if (raw && searchable.includes(raw)) return 10;
  if (searchText && searchable.includes(searchText)) return 11;
  if (tokens.length > 0 && matchesTokens(searchable, tokens)) return 12;
  return 13;
};

const filterAndSortMatches = (medicines: DbMedicine[], query: string) => {
  const parts = getSearchParts(query);
  const { raw, searchText, tokens, formulationHint } = parts;
  const targetLength = searchText.length || raw.length;

  return medicines
    .map(toRankedMedicine)
    .filter((medicine) => {
      if (searchText && medicine.searchableText.includes(searchText)) return true;
      return tokens.length > 0 && matchesTokens(medicine.searchableText, tokens);
    })
    .sort((a, b) => {
      const rankDiff = getMatchRank(a, parts) - getMatchRank(b, parts);
      if (rankDiff !== 0) return rankDiff;

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
  const { searchTerms } = getSearchParts(query);
  if (searchTerms.length === 0) return [];

  const refineMatches = (medicines: DbMedicine[]) => filterAndSortMatches(medicines, query).map(toSuggestion);
  const orFilters = searchTerms
    .flatMap((term) => [
      `name.ilike.%${term}%`,
      `generic.ilike.%${term}%`,
      `strength.ilike.%${term}%`,
    ])
    .join(",");

  const { data, error } = await supabase
    .from("medicines")
    .select("name, strength, generic, company")
    .or(orFilters)
    .limit(200);

  if (!error && data && data.length > 0) {
    const refined = refineMatches(data as unknown as DbMedicine[]);
    if (refined.length > 0) return refined;
  }

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
