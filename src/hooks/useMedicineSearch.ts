import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MedicineSuggestion {
  name: string;
  strength: string;
  generic: string;
  company: string;
  detectedType: string;
}

const detectType = (name: string, strength: string): string => {
  const n = name.toLowerCase();
  const s = strength.toLowerCase();
  const combined = `${n} ${s}`;
  const nameTokens = n.split(/[^a-z0-9]+/).filter(Boolean);
  const hasNameToken = (...patterns: RegExp[]) =>
    nameTokens.some((token) => patterns.some((pattern) => pattern.test(token)));

  if (/\bcream\b/i.test(combined) || hasNameToken(/cream$/)) return "Cream";
  if (/\bgel\b/i.test(combined) || hasNameToken(/gel$/)) return "Gel";
  if (/\blotion\b/i.test(combined) || hasNameToken(/lotion$/)) return "Lotion";
  if (/\bointment\b|\boint\b/i.test(combined) || hasNameToken(/ointment$/, /oint$/)) return "Oint";
  if (/\bshampoo\b/i.test(combined)) return "Shampoo";
  if (/\bspray\b/i.test(combined)) return "Spray";
  if (/\binhaler\b|\bhaler\b/i.test(combined) || /\/puff|mcg\/dose/i.test(s)) return "Inhaler";
  if (/\bnebuli[sz]er?\b|\brespules?\b/i.test(combined)) return "Nebu";
  if (/\bsuppository\b|\bsupp\b/i.test(combined) || hasNameToken(/supp$/, /suppo$/)) return "Supp";
  if (/\binjection\b|\binj\b/i.test(combined) || /\/vial|\/ampoule|\/prefilled|\/syringe/i.test(s)) return "Inj";
  if (/\bsuspension\b|\bsyrup\b|\bsyr\b|\bsyp\b|syrup preparation/i.test(combined) || (/\/5\s*ml|\/10\s*ml/i.test(s) && !/injection|iv|im/i.test(combined))) return "Syr";
  if (/\bdrop\b|\bdrops\b/i.test(combined) || hasNameToken(/drop$/, /drops$/) || (/\/ml|mg\/ml/i.test(s) && !/injection|iv|im|vial/i.test(combined))) return "Drop";
  if (/topical/i.test(s)) {
    if (/\blotion\b/i.test(n)) return "Lotion";
    if (/\bgel\b/i.test(n)) return "Gel";
    if (/\bointment\b|\boint\b/i.test(n)) return "Oint";
    return "Cream";
  }
  if (/sachet/i.test(combined)) return "Sachet";
  if (/\bcapsule\b/i.test(combined) || hasNameToken(/caps?$/)) return "Cap";

  return "Tab";
};

interface DbMedicine {
  name: string;
  strength: string;
  generic: string;
  company: string;
}

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

const sanitizeQuery = (query: string) => normalizeText(query);

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
]);

const getSearchParts = (query: string) => {
  const raw = sanitizeQuery(query);
  const rawTokens = raw.split(" ").filter(Boolean);
  const filteredTokens = rawTokens.filter((token) => !FORMULATION_QUERY_TERMS.has(token));
  const tokens = filteredTokens.length > 0 ? filteredTokens : rawTokens;
  const searchText = tokens.join(" ");
  const primaryToken = [...tokens].sort((a, b) => b.length - a.length)[0] || raw;

  return { searchText, tokens, primaryToken };
};

const buildSearchableText = (medicine: DbMedicine) => normalizeText(`${medicine.name} ${medicine.generic} ${medicine.strength}`);

const matchesTokens = (value: string, tokens: string[]) => tokens.every((token) => value.includes(token));

const getMatchRank = (medicine: DbMedicine, searchText: string, tokens: string[]) => {
  const name = normalizeText(medicine.name);
  const generic = normalizeText(medicine.generic);
  const searchable = buildSearchableText(medicine);

  if (searchText && name === searchText) return 0;
  if (searchText && generic === searchText) return 1;
  if (searchText && name.startsWith(searchText)) return 2;
  if (searchText && generic.startsWith(searchText)) return 3;
  if (tokens.length > 1 && matchesTokens(name, tokens)) return 4;
  if (tokens.length > 1 && matchesTokens(generic, tokens)) return 5;
  if (searchText && searchable.includes(searchText)) return 6;
  if (tokens.length > 0 && matchesTokens(searchable, tokens)) return 7;
  return 8;
};

const filterAndSortMatches = (medicines: DbMedicine[], query: string) => {
  const { searchText, tokens } = getSearchParts(query);

  return medicines
    .filter((medicine) => {
      const searchable = buildSearchableText(medicine);
      if (searchText && searchable.includes(searchText)) return true;
      return tokens.length > 0 && matchesTokens(searchable, tokens);
    })
    .sort((a, b) => {
      const rankDiff = getMatchRank(a, searchText, tokens) - getMatchRank(b, searchText, tokens);
      if (rankDiff !== 0) return rankDiff;

      const aNameDistance = Math.abs(normalizeText(a.name).length - searchText.length);
      const bNameDistance = Math.abs(normalizeText(b.name).length - searchText.length);
      if (aNameDistance !== bNameDistance) return aNameDistance - bNameDistance;

      return 0;
    })
    .slice(0, 20);
};

const toSuggestion = (medicine: DbMedicine): MedicineSuggestion => ({
  name: medicine.name,
  strength: medicine.strength,
  generic: medicine.generic,
  company: medicine.company,
  detectedType: detectType(medicine.name, medicine.strength),
});

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
  const { primaryToken } = getSearchParts(query);
  if (!primaryToken) return [];

  const refineMatches = (medicines: DbMedicine[]) => filterAndSortMatches(medicines, query).map(toSuggestion);

  const { data, error } = await supabase
    .from("medicines")
    .select("name, strength, generic, company")
    .or(`name.ilike.%${primaryToken}%,generic.ilike.%${primaryToken}%,strength.ilike.%${primaryToken}%`)
    .limit(60);

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

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const results = await searchFromDb(query);
      setSuggestions(results);
      setLoading(false);
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { suggestions, loading };
};
