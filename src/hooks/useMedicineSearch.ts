import { useState, useEffect, useRef } from "react";

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

interface RawMedicine {
  n: string;
  s: string;
  g: string;
  c: string;
  _lower?: string; // cached lowercase name
}

let cachedData: RawMedicine[] | null = null;
let loadingPromise: Promise<RawMedicine[]> | null = null;

const loadMedicines = (): Promise<RawMedicine[]> => {
  if (cachedData) return Promise.resolve(cachedData);
  if (loadingPromise) return loadingPromise;

  loadingPromise = fetch(import.meta.env.BASE_URL + "medicines.json")
    .then((r) => r.json())
    .then((data: RawMedicine[]) => {
      // Pre-compute lowercase names for faster search
      for (const med of data) {
        med._lower = med.n.toLowerCase();
      }
      cachedData = data;
      return data;
    });

  return loadingPromise;
};

// Preload on module import so data is ready when user starts typing
loadMedicines();

const searchMedicines = (data: RawMedicine[], query: string): MedicineSuggestion[] => {
  const q = query.toLowerCase();
  const startsWithResults: MedicineSuggestion[] = [];
  const containsResults: MedicineSuggestion[] = [];

  for (const med of data) {
    if (startsWithResults.length + containsResults.length >= 20) break;

    const lower = med._lower || med.n.toLowerCase();
    if (lower.startsWith(q)) {
      startsWithResults.push({
        name: med.n, strength: med.s, generic: med.g,
        company: med.c, detectedType: detectType(med.s),
      });
    } else if (lower.includes(q)) {
      containsResults.push({
        name: med.n, strength: med.s, generic: med.g,
        company: med.c, detectedType: detectType(med.s),
      });
    }
  }

  return [...startsWithResults, ...containsResults].slice(0, 20);
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
      const data = await loadMedicines();
      const results = searchMedicines(data, query);
      setSuggestions(results);
      setLoading(false);
    }, 100);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { suggestions, loading };
};
