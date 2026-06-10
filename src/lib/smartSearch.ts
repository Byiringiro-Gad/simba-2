import { Language, Product } from '@/types';

export interface SmartSearchResult {
  message: string;
  products: Product[];
  usedAI: boolean;
}

const STOP_WORDS = new Set([
  'do', 'you', 'have', 'i', 'a', 'an', 'the', 'is', 'are', 'want', 'need',
  'show', 'me', 'give', 'get', 'find', 'looking', 'for', 'any', 'some', 'please',
  'can', 'we', 'what', 'which', 'where', 'how', 'much', 'many', 'there', 'with',
  'and', 'or', 'of', 'in', 'on', 'to', 'it', 'be', 'this', 'that', 'something',
  'things', 'thing', 'stuff', 'help', 'hello', 'hi',
]);

const SHOPPING_HINT_GROUPS: string[][] = [
  ['breakfast', 'morning', 'cereal', 'porridge', 'bread', 'milk', 'egg', 'juice', 'yogurt', 'butter'],
  ['milk', 'lait', 'amata', 'dairy'],
  ['bread', 'pain', 'umugati', 'baguette', 'bakery'],
  ['water', 'eau', 'amazi', 'mineral', 'sparkling', 'still'],
  ['juice', 'jus', 'nectar'],
  ['egg', 'oeuf', 'amagi'],
  ['rice', 'riz', 'umuceli'],
  ['oil', 'huile', 'amavuta', 'cooking oil'],
  ['soap', 'savon', 'isabuni'],
  ['shampoo', 'lotion', 'cream', 'deodorant', 'cosmetic', 'beauty'],
  ['baby', 'infant', 'child', 'kid', 'diaper', 'couche', 'pampers'],
  ['clean', 'cleaning', 'detergent', 'bleach', 'mop', 'sponge', 'sanitary'],
  ['snack', 'biscuit', 'biscuits', 'chips', 'chocolate', 'candy', 'cracker'],
  ['meat', 'beef', 'chicken', 'pork', 'fish', 'sausage'],
  ['fruit', 'banana', 'mango', 'apple', 'orange'],
  ['vegetable', 'tomato', 'onion', 'carrot', 'cabbage', 'spinach'],
  ['drink', 'beverage', 'party', 'beer', 'wine', 'whisky'],
  ['kitchen', 'cook', 'cooking', 'pan', 'pot', 'knife', 'spoon', 'fork'],
  ['sports', 'sport', 'fitness', 'wellness', 'exercise'],
  ['pet', 'dog', 'cat', 'pet care'],
];

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeSearchText(value: string) {
  return normalizeSearchText(value)
    .split(' ')
    .map(token => token.trim())
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

function extractPriceLimit(query: string) {
  const normalized = normalizeSearchText(query);
  const cheapPatterns = /(cheap|affordable|budget|low cost|bon marche|buhoro|inexpensive)/i;
  const maxPricePatterns = [
    /(?:under|less than|below|up to|max(?:imum)?|budget(?: of)?|cheaper than)\s*(\d[\d, ]*(?:\.\d+)?)\s*(k|rwf)?/i,
    /(?:moins de|jusqu'?a|en dessous de)\s*(\d[\d, ]*(?:\.\d+)?)\s*(k|rwf)?/i,
    /(?:munsi ya|kugeza ku|ntabwo irenze)\s*(\d[\d, ]*(?:\.\d+)?)\s*(k|rwf)?/i,
    /\b(\d+(?:[.,]\d+)?)\s*k\b/i,
    /\b(\d[\d, ]+)\s*rwf\b/i,
  ];

  for (const pattern of maxPricePatterns) {
    const match = normalized.match(pattern);
    if (!match) continue;

    const raw = (match[1] ?? '').replace(/[\s,]/g, '');
    const suffix = (match[2] ?? '').toLowerCase();
    const numeric = Number(raw.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(numeric)) continue;

    return {
      maxPrice: suffix === 'k' ? Math.round(numeric * 1000) : numeric,
      cheapPreferred: cheapPatterns.test(normalized),
    };
  }

  return {
    maxPrice: null as number | null,
    cheapPreferred: cheapPatterns.test(normalized),
  };
}

function buildSearchTerms(query: string) {
  const normalized = normalizeSearchText(query);
  const tokens = tokenizeSearchText(query);
  const terms = new Set<string>(tokens);
  const phrases = new Set<string>();

  for (let size = 2; size <= 3; size += 1) {
    for (let i = 0; i <= tokens.length - size; i += 1) {
      const phrase = tokens.slice(i, i + size).join(' ');
      if (phrase.length > 3) phrases.add(phrase);
    }
  }

  if (tokens.length > 1) {
    phrases.add(tokens.join(' '));
  }

  for (const group of SHOPPING_HINT_GROUPS) {
    const hit = group.some(term => normalized.includes(normalizeSearchText(term)));
    if (!hit) continue;
    group.forEach(term => terms.add(normalizeSearchText(term)));
  }

  return {
    normalized,
    terms: Array.from(terms),
    phrases: Array.from(phrases),
    ...extractPriceLimit(query),
  };
}

function formatSearchMessage(language: Language, query: string, count: number, hasPriceLimit: boolean) {
  if (count > 0) {
    if (language === 'fr') {
      return hasPriceLimit
        ? `Voici les meilleurs resultats que j'ai trouves pour "${query}" dans votre budget.`
        : `Voici les meilleurs resultats que j'ai trouves pour "${query}".`;
    }

    if (language === 'rw') {
      return hasPriceLimit
        ? `Dore ibisubizo byiza nabonye kuri "${query}" mu giciro wasabye.`
        : `Dore ibisubizo byiza nabonye kuri "${query}".`;
    }

    return hasPriceLimit
      ? `Here are the best matches I found for "${query}" within your price range.`
      : `Here are the best matches I found for "${query}".`;
  }

  if (language === 'fr') {
    return `Je n'ai pas trouve de resultat proche pour "${query}". Essaie un nom de produit ou une categorie plus precise.`;
  }

  if (language === 'rw') {
    return `Nta bicuruzwa byegeranye nabonye kuri "${query}". Gerageza izina ry'igicuruzwa cyangwa icyiciro gisobanutse neza.`;
  }

  return `I could not find a close match for "${query}". Try a more specific product name or category.`;
}

export function resolveProductsByNames(productNames: string[], products: Product[]) {
  const selected: Product[] = [];
  const seen = new Set<number>();

  for (const candidate of productNames) {
    const normalizedCandidate = normalizeSearchText(candidate);
    if (!normalizedCandidate) continue;

    let bestProduct: Product | null = null;
    let bestScore = 0;

    for (const product of products) {
      if (seen.has(product.id)) continue;

      const name = normalizeSearchText(product.name);
      const category = normalizeSearchText(product.category);
      let score = 0;

      if (name === normalizedCandidate) score += 10;
      if (name.includes(normalizedCandidate) || normalizedCandidate.includes(name)) score += 6;
      if (category.includes(normalizedCandidate)) score += 4;

      const queryTerms = normalizedCandidate.split(' ').filter(term => term.length > 1);
      const overlap = queryTerms.filter(term => name.includes(term) || category.includes(term)).length;
      score += overlap;

      if (score > bestScore) {
        bestProduct = product;
        bestScore = score;
      }
    }

    if (bestProduct && bestScore > 0) {
      seen.add(bestProduct.id);
      selected.push(bestProduct);
    }
  }

  return selected;
}

export function smartSearchProducts(query: string, products: Product[], language: Language): SmartSearchResult {
  const trimmed = query.trim();
  if (!trimmed) {
    return { message: '', products: [], usedAI: false };
  }

  const { normalized, terms, phrases, maxPrice, cheapPreferred } = buildSearchTerms(trimmed);
  const cheapCap = maxPrice ?? (cheapPreferred ? 3500 : null);
  const queryTokens = normalized.split(' ').filter(token => token.length > 1);

  const ranked = products
    .map(product => {
      const name = normalizeSearchText(product.name);
      const category = normalizeSearchText(product.category);
      const combined = `${name} ${category}`;
      let score = 0;

      for (const phrase of phrases) {
        if (combined.includes(phrase)) score += 5;
      }

      for (const term of terms) {
        if (name.includes(term)) score += 4;
        else if (category.includes(term)) score += 2.5;
        else if (combined.includes(term)) score += 1;
      }

      const overlap = queryTokens.filter(token => combined.includes(token)).length;
      score += overlap * 0.5;

      if (cheapCap !== null) {
        if (product.price <= cheapCap) score += 1.5;
        if (product.price > cheapCap * 1.5) score -= 0.5;
      }

      if (/fresh|new|daily/i.test(normalized) && /fresh|new|daily/i.test(name)) {
        score += 1;
      }

      return { product, score };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.product.price - b.product.price;
    })
    .slice(0, 8)
    .map(entry => entry.product);

  return {
    message: formatSearchMessage(language, trimmed, ranked.length, maxPrice !== null),
    products: ranked,
    usedAI: false,
  };
}
