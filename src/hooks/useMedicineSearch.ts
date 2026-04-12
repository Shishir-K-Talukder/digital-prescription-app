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

type MedicineTypeGroup = "topical" | "oralUnitSolid" | "oralSachet" | "oralLiquid" | "injectable" | "inhaled" | "suppository" | "other";

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

type TypeCountMap = Map<string, number>;

interface TypeInferenceContext {
  brandTypeCounts: Map<string, TypeCountMap>;
  genericTypeCounts: Map<string, TypeCountMap>;
}

const CAPSULE_PREFERRED_GENERIC_DEFAULTS = new Set([
  "omeprazole",
]);

let derivedCapsulePreferredGenericDefaults = new Set<string>();

const isCapsulePreferredGeneric = (genericKey: string) =>
  CAPSULE_PREFERRED_GENERIC_DEFAULTS.has(genericKey) || derivedCapsulePreferredGenericDefaults.has(genericKey);

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

const sanitizeQuery = (query: string) => normalizeText(query);

const tokenizeText = (value: string) => normalizeText(value).split(" ").filter(Boolean);

const detectExplicitType = (name: string, strength: string, generic = ""): string | null => {
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

  // --- Inhalation forms (must come before capsule/tablet to avoid misdetection) ---
  if (/\binhalation\b.*\bcapsule\b|\binhalation capsule\b/i.test(combined)) return "Inhaler";
  if (/\binhaler\b|\bhaler\b|\binhalation\b|\binhalation aerosol\b/i.test(combined) || /\/puff|mcg\/dose/i.test(s)) return "Inhaler";
  if (/\bnebuli[sz]er?\b|\brespules?\b|\brespirator\b|\bsolution for inhalation\b/i.test(combined)) return "Nebu";

  // --- Topical / External ---
  if (/\bvaginal cream\b/i.test(combined)) return "Cream";
  if (/\bvaginal gel\b/i.test(combined)) return "Gel";
  if (/\bvaginal pessary\b/i.test(combined)) return "Supp";
  if (/\bvaginal tablet\b/i.test(combined)) return "Tab";
  if (/\bvaginal\b/i.test(g)) return "Tab";
  if (/\bcream\b/i.test(combined) || hasNameOrGenericToken(/cream$/)) return "Cream";
  if (/\bgel\b|\bjelly\b/i.test(combined) || hasNameOrGenericToken(/gel$/)) return "Gel";
  if (/\blotion\b/i.test(combined) || hasNameOrGenericToken(/lotion$/)) return "Lotion";
  if (/\beye ointment\b|\bointment\b|\boint\b/i.test(combined) || hasNameOrGenericToken(/ointment$/, /oint$/)) return "Oint";
  if (/\bshampoo\b/i.test(combined)) return "Shampoo";
  if (/\bnasal spray\b|\bspray\b/i.test(combined)) return "Spray";
  if (/\bdental paste\b|\bpaste\b/i.test(combined)) return "Paste";
  if (/\bnail lacquer\b/i.test(combined)) return "Lacquer";

  // --- Injectable ---
  if (/\binjection\b|\binj\b|\biv infusion\b|\bsc injection\b/i.test(combined) || /\/vial|\/ampoule|\/prefilled|\/syringe/i.test(s)) return "Inj";

  // --- Suppository / Rectal ---
  if (/\bsuppository\b|\bsupp\b|\brectal\b/i.test(combined) || hasNameOrGenericToken(/supp$/, /suppo$/)) return "Supp";

  // --- Liquid / Oral solution ---
  if (/\boral solution\b/i.test(combined)) return "Syr";
  if (/\bsuspension\b|\bdry syrup\b|\bsyrup\b|\bsyr\b|\bsyp\b|powder for suspension|syrup preparation/i.test(combined) || (/\/5\s*ml|\/10\s*ml|\/15\s*ml/i.test(s) && !/injection|iv|im/i.test(combined))) return "Syr";

  // --- Drops (ophthalmic, otic, nasal, ear drop, eye/ear) ---
  if (/\bdrop\b|\bdrops\b|\bophthalmic\b|\botic\b|\bnasal\b|\bear drop\b|\beye\/ear\b|\bophthalmic solution\b|\bnasal preparation\b/i.test(combined) || hasNameOrGenericToken(/drop$/, /drops$/) || (/\/ml|mg\/ml/i.test(s) && !/injection|iv|im|vial/i.test(combined))) return "Drop";

  // --- Topical (generic fallback) ---
  if (/topical/i.test(s) || /topical/i.test(g)) {
    if (/\blotion\b/i.test(n)) return "Lotion";
    if (/\bgel\b/i.test(n)) return "Gel";
    if (/\bointment\b|\boint\b/i.test(n)) return "Oint";
    return "Cream";
  }

  // --- Oral solid ---
  if (/sachet/i.test(combined)) return "Sachet";
  if (/\bmups\b/i.test(combined)) return "Tab";
  if (/\bextended release\b|\bprolonged release\b/i.test(combined)) return "Tab";
  if (/\bcapsule\b|\bsoftgel\b/i.test(combined) || hasNameOrGenericToken(/caps?$/)) return "Cap";
  if (/\btablet\b|\btablets\b/i.test(combined) || hasNameOrGenericToken(/tabs?$/, /tablet$/)) return "Tab";

  return null;
};

const detectType = (name: string, strength: string, generic = "") => {
  const medicine = { name, strength, generic, company: "" } satisfies DbMedicine;
  return detectExplicitType(name, strength, generic) ?? getDefaultTypeForGroup(inferTypeGroup(medicine), medicine);
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
  "ophthalmic", "otic", "nasal",
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
  if (["Tab", "Cap"].includes(type)) return "oralUnitSolid";
  if (type === "Sachet") return "oralSachet";
  if (["Syr", "Drop"].includes(type)) return "oralLiquid";
  if (type === "Inj") return "injectable";
  if (["Inhaler", "Nebu"].includes(type)) return "inhaled";
  if (type === "Supp") return "suppository";
  return "other";
};

const normalizeGenericLookup = (value: string) => normalizeText(value.replace(/\([^)]*\)/g, " "));

const getTypeLookupKey = (value: string, group: MedicineTypeGroup) => `${value}__${group}`;

const incrementTypeCount = (lookup: Map<string, TypeCountMap>, key: string, type: string) => {
  const counts = lookup.get(key) ?? new Map<string, number>();
  counts.set(type, (counts.get(type) ?? 0) + 1);
  lookup.set(key, counts);
};

const buildCapsulePreferredGenericDefaults = (medicines: DbMedicine[]) => {
  const explicitSolidCounts = new Map<string, { cap: number; tab: number }>();

  medicines.forEach((medicine) => {
    const explicitType = detectExplicitType(medicine.name, medicine.strength, medicine.generic);
    if (explicitType !== "Cap" && explicitType !== "Tab") return;

    const genericKey = normalizeGenericLookup(medicine.generic);
    if (!genericKey) return;

    const counts = explicitSolidCounts.get(genericKey) ?? { cap: 0, tab: 0 };
    if (explicitType === "Cap") counts.cap += 1;
    else counts.tab += 1;
    explicitSolidCounts.set(genericKey, counts);
  });

  const defaults = new Set<string>();
  explicitSolidCounts.forEach((counts, genericKey) => {
    if (counts.cap > 0 && counts.tab === 0) defaults.add(genericKey);
  });

  return defaults;
};

const getDominantType = (counts: TypeCountMap | undefined) => {
  if (!counts || counts.size === 0) return null;

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (sorted.length === 1) return sorted[0][0];

  const [topType, topCount] = sorted[0];
  const secondCount = sorted[1][1];
  return topCount >= secondCount + 2 || topCount >= secondCount * 1.5 ? topType : null;
};

const shouldDefaultToCapsule = (medicine: DbMedicine, group: MedicineTypeGroup) => {
  if (group !== "oralUnitSolid") return false;

  const combined = `${medicine.name} ${medicine.strength} ${medicine.generic}`.toLowerCase();
  if (/\btablet\b|\btablets\b|\bmups\b|sachet/i.test(combined)) return false;

  return isCapsulePreferredGeneric(normalizeGenericLookup(medicine.generic));
};

const inferTypeGroup = (medicine: DbMedicine): MedicineTypeGroup => {
  const explicitType = detectExplicitType(medicine.name, medicine.strength, medicine.generic);
  if (explicitType) return getTypeGroup(explicitType);

  const s = medicine.strength.toLowerCase();
  const combined = `${medicine.name} ${medicine.strength} ${medicine.generic}`.toLowerCase();

  if (/\binjection\b|\binj\b|\/vial|\/ampoule|\/prefilled|\/syringe/i.test(combined)) return "injectable";
  if (/\bcream\b|\bgel\b|\blotion\b|\bointment\b|\boint\b|\bshampoo\b|\bspray\b|\btopical\b/i.test(combined)) return "topical";
  if (/\binhaler\b|\bhaler\b|\/puff|mcg\/dose|\bnebuli[sz]er?\b|\brespules?\b/i.test(combined)) return "inhaled";
  if (/\bsuppository\b|\bsupp\b/i.test(combined)) return "suppository";
  if (/\bsuspension\b|\bdry syrup\b|\bsyrup\b|\bsyr\b|\bsyp\b|powder for suspension|\bophthalmic\b|\botic\b|\bnasal\b/i.test(combined)) return "oralLiquid";
  if ((/\/5\s*ml|\/10\s*ml|\/15\s*ml/i.test(s) || /\/ml|mg\/ml/i.test(s)) && !/injection|iv|im|vial/i.test(combined)) return "oralLiquid";
  if (/sachet/i.test(combined)) return "oralSachet";
  if (/\d/.test(s) || /\bcapsule\b|\bsoftgel\b|\btablet\b|\btablets\b/i.test(combined)) return "oralUnitSolid";
  return "other";
};

const getDefaultTypeForGroup = (group: MedicineTypeGroup, medicine: DbMedicine) => {
  const combined = `${medicine.name} ${medicine.strength} ${medicine.generic}`.toLowerCase();
  const genericKey = normalizeGenericLookup(medicine.generic);

  if (group === "topical") {
    if (/\blotion\b/i.test(combined)) return "Lotion";
    if (/\bgel\b/i.test(combined)) return "Gel";
    if (/\bointment\b|\boint\b/i.test(combined)) return "Oint";
    return "Cream";
  }

  if (group === "oralLiquid") {
    if (/\bophthalmic\b|\botic\b|\bnasal\b|\bdrop\b|\bdrops\b/i.test(combined)) return "Drop";
    if (/\/ml|mg\/ml/i.test(medicine.strength) && !/\/5\s*ml|\/10\s*ml|\/15\s*ml/i.test(medicine.strength)) return "Drop";
    return "Syr";
  }

  if (group === "injectable") return "Inj";
  if (group === "inhaled") return /\bnebu\b|\bneb\b|\brespules?\b/i.test(combined) ? "Nebu" : "Inhaler";
  if (group === "suppository") return "Supp";
  if (group === "oralSachet") return "Sachet";
  if (group === "oralUnitSolid") {
    if (isCapsulePreferredGeneric(genericKey)) return "Cap";
    return "Tab";
  }

  return "Tab";
};

const buildTypeInferenceContext = (medicines: DbMedicine[]): TypeInferenceContext => {
  const brandTypeCounts = new Map<string, TypeCountMap>();
  const genericTypeCounts = new Map<string, TypeCountMap>();

  medicines.forEach((medicine) => {
    const explicitType = detectExplicitType(medicine.name, medicine.strength, medicine.generic);
    if (!explicitType) return;

    const group = getTypeGroup(explicitType);
    incrementTypeCount(brandTypeCounts, getTypeLookupKey(normalizeText(medicine.name), group), explicitType);

    const genericKey = normalizeGenericLookup(medicine.generic);
    if (genericKey) {
      incrementTypeCount(genericTypeCounts, getTypeLookupKey(genericKey, group), explicitType);
    }
  });

  return { brandTypeCounts, genericTypeCounts };
};

const mergeTypeCountMaps = (target: Map<string, TypeCountMap>, source: Map<string, TypeCountMap>) => {
  source.forEach((counts, key) => {
    const existing = target.get(key) ?? new Map<string, number>();
    counts.forEach((count, type) => {
      existing.set(type, (existing.get(type) ?? 0) + count);
    });
    target.set(key, existing);
  });
};

const mergeTypeInferenceContexts = (...contexts: Array<TypeInferenceContext | null | undefined>): TypeInferenceContext => {
  const brandTypeCounts = new Map<string, TypeCountMap>();
  const genericTypeCounts = new Map<string, TypeCountMap>();

  contexts.forEach((context) => {
    if (!context) return;
    mergeTypeCountMaps(brandTypeCounts, context.brandTypeCounts);
    mergeTypeCountMaps(genericTypeCounts, context.genericTypeCounts);
  });

  return { brandTypeCounts, genericTypeCounts };
};

const inferTypeFromContext = (medicine: DbMedicine, context: TypeInferenceContext) => {
  const explicitType = detectExplicitType(medicine.name, medicine.strength, medicine.generic);
  if (explicitType) return explicitType;

  const group = inferTypeGroup(medicine);
  const brandType = getDominantType(context.brandTypeCounts.get(getTypeLookupKey(normalizeText(medicine.name), group)));
  if (brandType) return brandType;

  if (shouldDefaultToCapsule(medicine, group)) return "Cap";

  const genericKey = normalizeGenericLookup(medicine.generic);
  if (genericKey) {
    const genericType = getDominantType(context.genericTypeCounts.get(getTypeLookupKey(genericKey, group)));
    if (genericType) return genericType;
  }

  return getDefaultTypeForGroup(group, medicine);
};

const detectFormulationHint = (query: string): FormulationHint | null => {
  const raw = sanitizeQuery(query);
  if (!raw) return null;

  if (/\bointment\b|\boint\b/.test(raw)) return { exactType: "Oint", group: "topical" };
  if (/\blotion\b/.test(raw)) return { exactType: "Lotion", group: "topical" };
  if (/\bcream\b/.test(raw)) return { exactType: "Cream", group: "topical" };
  if (/\bgel\b/.test(raw)) return { exactType: "Gel", group: "topical" };
  if (/\bsachet\b/.test(raw)) return { exactType: "Sachet", group: "oralSachet" };
  if (/\bcapsule\b|\bcaps\b|\bcap\b|\bsoftgel\b/.test(raw)) return { exactType: "Cap", group: "oralUnitSolid" };
  if (/\btablet\b|\btablets\b|\btab\b|\btabs\b/.test(raw)) return { exactType: "Tab", group: "oralUnitSolid" };
  if (/\bsyrup\b|\bsuspension\b|\bsyr\b|\bsyp\b/.test(raw)) return { exactType: "Syr", group: "oralLiquid" };
  if (/\bdrop\b|\bdrops\b/.test(raw)) return { exactType: "Drop", group: "oralLiquid" };
  if (/\binjection\b|\binj\b|\bvial\b|\bamp\b|\bampoule\b/.test(raw)) return { exactType: "Inj", group: "injectable" };
  if (/\binhaler\b|\bpuff\b/.test(raw)) return { exactType: "Inhaler", group: "inhaled" };
  if (/\bnebu\b|\bneb\b|\brespules?\b|\bnebulizer\b|\bnebuliser\b/.test(raw)) return { exactType: "Nebu", group: "inhaled" };
  if (/\bsupp\b|\bsuppository\b/.test(raw)) return { exactType: "Supp", group: "suppository" };
  if (/\bophthalmic\b|\botic\b|\bnasal\b/.test(raw)) return { exactType: "Drop", group: "oralLiquid" };

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

const toRankedMedicine = (medicine: DbMedicine, context: TypeInferenceContext): RankedMedicine => ({
  ...medicine,
  detectedType: inferTypeFromContext(medicine, context),
  normalizedName: normalizeText(medicine.name),
  normalizedGeneric: normalizeText(medicine.generic),
  normalizedStrength: normalizeText(medicine.strength),
  strengthTokens: tokenizeStrengthText(medicine.strength),
  searchableText: buildSearchableText(medicine),
});

const rankMedicinesWithContext = (medicines: DbMedicine[], context: TypeInferenceContext) =>
  medicines.map((medicine) => toRankedMedicine(medicine, context));

const rankMedicines = (medicines: DbMedicine[], baseContext?: TypeInferenceContext) => {
  const localContext = buildTypeInferenceContext(medicines);
  const context = baseContext ? mergeTypeInferenceContexts(baseContext, localContext) : localContext;
  return rankMedicinesWithContext(medicines, context);
};

const getFormulationPriority = (medicine: RankedMedicine, formulationHint: FormulationHint | null) => {
  if (!formulationHint) return 0;
  if (medicine.detectedType === formulationHint.exactType) return 0;
  if (getTypeGroup(medicine.detectedType) === formulationHint.group) return 1;
  return 2;
};

const getStrengthPriority = (medicine: RankedMedicine, strengthTokens: string[]) => {
  if (strengthTokens.length === 0) return 0;

  const hasExactStrengthMatch = strengthTokens.every((token) => medicine.strengthTokens.includes(token));
  if (hasExactStrengthMatch) {
    const extraStrengthTokens = medicine.strengthTokens.filter((token) => !strengthTokens.includes(token));
    if (extraStrengthTokens.length === 0) return 0;
    if (extraStrengthTokens.every((token) => STRENGTH_QUERY_TERMS.has(token))) return 1;
    if (extraStrengthTokens.some((token) => FORMULATION_QUERY_TERMS.has(token))) return 2;
    return 3;
  }

  const numericTokens = strengthTokens.filter((token) => /\d/.test(token));
  const hasNumericStrengthMatch = numericTokens.length > 0 && numericTokens.every((token) => medicine.strengthTokens.includes(token));
  if (hasNumericStrengthMatch) {
    const extraNumericTokens = medicine.strengthTokens.filter((token) => !numericTokens.includes(token));
    if (extraNumericTokens.every((token) => STRENGTH_QUERY_TERMS.has(token))) return 4;
    if (extraNumericTokens.some((token) => FORMULATION_QUERY_TERMS.has(token))) return 5;
    return 6;
  }

  if (strengthTokens.some((token) => medicine.strengthTokens.includes(token))) return 7;
  return 8;
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

const filterAndSortRankedMatches = (medicines: RankedMedicine[], query: string) => {
  const parts = getSearchParts(query);
  const { raw, searchText, tokens, brandTokens, strengthTokens, formulationHint } = parts;
  const targetLength = searchText.length || raw.length;

  return medicines
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

const filterAndSortMatches = (medicines: DbMedicine[], query: string, baseContext?: TypeInferenceContext) =>
  filterAndSortRankedMatches(rankMedicines(medicines, baseContext), query);

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
let fallbackRankedData: RankedMedicine[] | null = null;
let fallbackTypeContext: TypeInferenceContext | null = null;

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

const loadFallbackTypeContext = async (): Promise<TypeInferenceContext> => {
  if (fallbackTypeContext) return fallbackTypeContext;

  const medicines = await loadFallback();
  derivedCapsulePreferredGenericDefaults = buildCapsulePreferredGenericDefaults(medicines);
  fallbackTypeContext = buildTypeInferenceContext(medicines);
  return fallbackTypeContext;
};

const loadFallbackRanked = async (): Promise<RankedMedicine[]> => {
  if (fallbackRankedData) return fallbackRankedData;
  const medicines = await loadFallback();
  fallbackRankedData = rankMedicinesWithContext(medicines, await loadFallbackTypeContext());
  return fallbackRankedData;
};

const searchFromDb = async (query: string): Promise<MedicineSuggestion[]> => {
  const { nameSearchTerms, searchTerms } = getSearchParts(query);
  if (nameSearchTerms.length === 0 && searchTerms.length === 0) return [];

  const fallbackContext = await loadFallbackTypeContext();
  const refineMatches = (medicines: DbMedicine[]) => filterAndSortMatches(medicines, query, fallbackContext).map(toSuggestion);
  const fallbackMatches = filterAndSortRankedMatches(await loadFallbackRanked(), query);
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

  const refined = refineMatches(dedupeMedicines([
    ...candidates,
    ...fallbackMatches.map(({ name, strength, generic, company }) => ({ name, strength, generic, company })),
  ]));
  if (refined.length > 0) return refined;

  return fallbackMatches.map(toSuggestion);
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
