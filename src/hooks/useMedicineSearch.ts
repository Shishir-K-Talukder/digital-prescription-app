import { useState, useEffect, useRef } from "react";

export interface MedicineSuggestion {
  name: string;
  strength: string;
  generic: string;
  company: string;
}

// Scrape medex.com.bd search results for medicine suggestions
const parseMedicines = (html: string): MedicineSuggestion[] => {
  const results: MedicineSuggestion[] = [];
  const regex = /<a[^>]*href="https?:\/\/medex\.com\.bd\/brands\/\d+\/[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const raw = match[1].replace(/<[^>]+>/g, '\n');
    const parts = raw.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length >= 1 && parts[0].length > 1) {
      results.push({
        name: parts[0],
        strength: parts[1] || '',
        generic: parts[2] || '',
        company: parts[3] || '',
      });
    }
  }
  return results;
};

// Use a CORS proxy to fetch medex data
const fetchMedicines = async (query: string): Promise<MedicineSuggestion[]> => {
  if (query.length < 2) return [];
  try {
    const url = `https://medex.com.bd/brands?q=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) return [];
    const html = await resp.text();
    return parseMedicines(html);
  } catch {
    return [];
  }
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
      const results = await fetchMedicines(query);
      setSuggestions(results);
      setLoading(false);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { suggestions, loading };
};
