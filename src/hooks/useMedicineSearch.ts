import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MedicineSuggestion {
  name: string;
  strength: string;
  generic: string;
  company: string;
  detectedType: string;
}

const detectType = (strength: string): string => {
  const s = strength.toLowerCase();
  if (/\/5\s*ml|\/ml|mg\/ml/.test(s) && !/injection|iv|im/.test(s)) return "Syr";
  if (/drop|\/drop/.test(s)) return "Drop";
  if (/cream/i.test(s)) return "Cream";
  if (/ointment|oint/i.test(s)) return "Oint";
  if (/suppository|supp/i.test(s)) return "Supp";
  if (/injection|iv|im|\/vial|\/ampoule/i.test(s)) return "Inj";
  if (/capsule|cap/i.test(s)) return "Cap";
  return "Tab";
};

interface DbMedicine {
  name: string;
  strength: string;
  generic: string;
  company: string;
}

const sanitizeQuery = (query: string) => query.trim().replace(/[,%()']/g, " ").replace(/\s+/g, " ").trim();

const getMatchRank = (medicine: Pick<DbMedicine, "name" | "generic">, query: string) => {
  const name = medicine.name.toLowerCase();
  const generic = medicine.generic.toLowerCase();

  if (name.startsWith(query)) return 0;
  if (generic.startsWith(query)) return 1;
  if (name.includes(query)) return 2;
  if (generic.includes(query)) return 3;
  return 4;
};

const toSuggestion = (medicine: DbMedicine): MedicineSuggestion => ({
  name: medicine.name,
  strength: medicine.strength,
  generic: medicine.generic,
  company: medicine.company,
  detectedType: detectType(medicine.strength),
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
  const sanitizedQuery = sanitizeQuery(query);
  if (!sanitizedQuery) return [];

  // Try database first
  const { data, error } = await supabase
    .from("medicines")
    .select("name, strength, generic, company")
    .or(`name.ilike.%${sanitizedQuery}%,generic.ilike.%${sanitizedQuery}%`)
    .limit(30);

  if (error || !data || data.length === 0) {
    // Fallback to static JSON
    const fallback = await loadFallback();
    const q = sanitizedQuery.toLowerCase();
    const matches: DbMedicine[] = [];
    for (const med of fallback) {
      const matchesName = med.name.toLowerCase().includes(q);
      const matchesGeneric = med.generic.toLowerCase().includes(q);
      if (matchesName || matchesGeneric) {
        matches.push(med);
      }
      if (matches.length >= 40) break;
    }
    return matches
      .sort((a, b) => getMatchRank(a, q) - getMatchRank(b, q))
      .slice(0, 20)
      .map(toSuggestion);
  }

  // Sort: name starts-with first, then generic starts-with, then contains
  const q = sanitizedQuery.toLowerCase();
  const sorted = (data as unknown as DbMedicine[]).sort((a, b) => {
    return getMatchRank(a, q) - getMatchRank(b, q);
  });

  return sorted.map(toSuggestion);
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
