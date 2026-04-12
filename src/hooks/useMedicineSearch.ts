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
  // Try database first
  const { data, error } = await supabase
    .from("medicines")
    .select("name, strength, generic, company")
    .ilike("name", `%${query}%`)
    .limit(20);

  if (error || !data || data.length === 0) {
    // Fallback to static JSON
    const fallback = await loadFallback();
    const q = query.toLowerCase();
    const starts: MedicineSuggestion[] = [];
    const contains: MedicineSuggestion[] = [];
    for (const med of fallback) {
      if (starts.length + contains.length >= 20) break;
      const lower = med.name.toLowerCase();
      const suggestion: MedicineSuggestion = {
        name: med.name, strength: med.strength, generic: med.generic,
        company: med.company, detectedType: detectType(med.strength),
      };
      if (lower.startsWith(q)) starts.push(suggestion);
      else if (lower.includes(q)) contains.push(suggestion);
    }
    return [...starts, ...contains].slice(0, 20);
  }

  // Sort: starts-with first, then contains
  const q = query.toLowerCase();
  const sorted = (data as unknown as DbMedicine[]).sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    return aStarts - bStarts;
  });

  return sorted.map((m) => ({
    name: m.name, strength: m.strength, generic: m.generic,
    company: m.company, detectedType: detectType(m.strength),
  }));
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
