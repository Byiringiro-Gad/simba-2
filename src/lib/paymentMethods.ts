import { Language, PaymentMethod } from '@/types';

const LABELS: Record<PaymentMethod, Record<Language, string>> = {
  mtn: {
    en: 'MTN MoMo',
    fr: 'MTN MoMo',
    rw: 'MTN MoMo',
  },
  airtel: {
    en: 'Airtel Money',
    fr: 'Airtel Money',
    rw: 'Airtel Money',
  },
  card: {
    en: 'Card',
    fr: 'Carte',
    rw: 'Ikarita',
  },
};

const SUB_LABELS: Record<PaymentMethod, Record<Language, string>> = {
  mtn: {
    en: 'Mobile Money Rwanda',
    fr: 'Mobile Money Rwanda',
    rw: 'Mobile Money Rwanda',
  },
  airtel: {
    en: 'Airtel Rwanda',
    fr: 'Airtel Rwanda',
    rw: 'Airtel Rwanda',
  },
  card: {
    en: 'Visa / Mastercard',
    fr: 'Visa / Mastercard',
    rw: 'Visa / Mastercard',
  },
};

const NOTES: Record<PaymentMethod, Record<Language, string>> = {
  mtn: {
    en: "You'll receive an MTN MoMo notification to confirm your payment.",
    fr: "Vous recevrez une notification MTN MoMo pour confirmer votre paiement.",
    rw: "Uzakira ubutumwa bwa MTN MoMo bwo kwemeza kwishura.",
  },
  airtel: {
    en: "You'll receive an Airtel Money notification to confirm your payment.",
    fr: "Vous recevrez une notification Airtel Money pour confirmer votre paiement.",
    rw: "Uzakira ubutumwa bwa Airtel Money bwo kwemeza kwishura.",
  },
  card: {
    en: 'Card payments are confirmed securely at pickup.',
    fr: 'Les paiements par carte sont confirmés en toute sécurité au retrait.',
    rw: "Kwishura ukoresheje ikarita byemezwa neza igihe ugiye gufata.",
  },
};

export const PAYMENT_METHODS: PaymentMethod[] = ['mtn', 'airtel', 'card'];

export const PAYMENT_METHOD_THEMES: Record<PaymentMethod, {
  activeBg: string;
  activeText: string;
  activeBorder: string;
  badgeBg: string;       // badge bg when selected
  badgeText: string;     // badge text when selected
  idleBg: string;        // badge bg when NOT selected (brand color)
  idleText: string;      // badge text when NOT selected
  idleBorder: string;    // button border when NOT selected
  radioDot: string;      // radio dot color when selected
}> = {
  mtn: {
    activeBg:    'bg-[#FFCC00]',
    activeText:  'text-gray-900',
    activeBorder:'border-[#FFCC00]',
    badgeBg:     'bg-[#FFCC00]',
    badgeText:   'text-gray-900',
    idleBg:      'bg-[#FFCC00]',
    idleText:    'text-gray-900',
    idleBorder:  'border-[#FFCC00]/40 dark:border-[#FFCC00]/30',
    radioDot:    'border-gray-900 bg-gray-900',
  },
  airtel: {
    activeBg:    'bg-[#ED1C24]',
    activeText:  'text-white',
    activeBorder:'border-[#ED1C24]',
    badgeBg:     'bg-[#ED1C24]',
    badgeText:   'text-white',
    idleBg:      'bg-[#ED1C24]',
    idleText:    'text-white',
    idleBorder:  'border-[#ED1C24]/40 dark:border-[#ED1C24]/50',
    radioDot:    'border-white bg-white',
  },
  card: {
    activeBg:    'bg-slate-900 dark:bg-slate-700',
    activeText:  'text-white',
    activeBorder:'border-slate-900 dark:border-slate-600',
    badgeBg:     'bg-slate-900 dark:bg-slate-700',
    badgeText:   'text-white',
    idleBg:      'bg-slate-700 dark:bg-slate-600',
    idleText:    'text-white',
    idleBorder:  'border-slate-300 dark:border-slate-600',
    radioDot:    'border-white bg-white',
  },
};

export function normalizePaymentMethod(value: string | null | undefined): PaymentMethod {
  return value === 'airtel' || value === 'card' ? value : 'mtn';
}

export function getPaymentMethodLabel(method: PaymentMethod, language: Language) {
  return LABELS[method][language] ?? LABELS[method].en;
}

export function getPaymentMethodSubLabel(method: PaymentMethod, language: Language) {
  return SUB_LABELS[method][language] ?? SUB_LABELS[method].en;
}

export function getPaymentMethodNote(method: PaymentMethod, language: Language) {
  return NOTES[method][language] ?? NOTES[method].en;
}

export function isMobileMoneyPayment(method: PaymentMethod) {
  return method === 'mtn' || method === 'airtel';
}
