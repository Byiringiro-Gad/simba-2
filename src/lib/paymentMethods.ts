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
  cod: {
    en: 'Cash on Delivery',
    fr: 'Paiement à la livraison',
    rw: 'Kwishura ugiye gufata',
  },
};

const SUB_LABELS: Record<PaymentMethod, Record<Language, string>> = {
  mtn: { en: 'Mobile Money Rwanda', fr: 'Mobile Money Rwanda', rw: 'Mobile Money Rwanda' },
  airtel: { en: 'Airtel Rwanda', fr: 'Airtel Rwanda', rw: 'Airtel Rwanda' },
  card: { en: 'Visa / Mastercard', fr: 'Visa / Mastercard', rw: 'Visa / Mastercard' },
  cod: { en: 'Pay balance at pickup', fr: 'Payer le solde au retrait', rw: 'Wishura isigaye ugiye gufata' },
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
  cod: {
    en: 'Pay the full amount in cash when you collect your order at the branch.',
    fr: "Payez la totalité en espèces lors du retrait de votre commande à l'agence.",
    rw: "Wishura byose mu mfaranga igihe ugiye gufata itumizwa ryawe ku ishami.",
  },
};

export const PAYMENT_METHODS: PaymentMethod[] = ['mtn', 'airtel', 'card', 'cod'];

export const PAYMENT_METHOD_THEMES: Record<PaymentMethod, {
  activeBg: string;
  activeText: string;
  activeBorder: string;
  badgeBg: string;
  badgeText: string;
  idleBg: string;
  idleText: string;
  idleBorder: string;
  radioDot: string;
}> = {
  mtn: {
    activeBg: 'bg-[#FFCC00]', activeText: 'text-gray-900', activeBorder: 'border-[#FFCC00]',
    badgeBg: 'bg-[#FFCC00]', badgeText: 'text-gray-900',
    idleBg: 'bg-[#FFCC00]', idleText: 'text-gray-900',
    idleBorder: 'border-yellow-300 dark:border-yellow-500/50',
    radioDot: 'border-gray-900 bg-gray-900',
  },
  airtel: {
    activeBg: 'bg-red-600', activeText: 'text-white', activeBorder: 'border-red-600',
    badgeBg: 'bg-red-600', badgeText: 'text-white',
    idleBg: 'bg-red-600', idleText: 'text-white',
    idleBorder: 'border-red-300 dark:border-red-600/60',
    radioDot: 'border-red-600 bg-red-600',
  },
  card: {
    activeBg: 'bg-slate-800 dark:bg-slate-700', activeText: 'text-white', activeBorder: 'border-slate-800 dark:border-slate-600',
    badgeBg: 'bg-slate-800 dark:bg-slate-700', badgeText: 'text-white',
    idleBg: 'bg-slate-700', idleText: 'text-white',
    idleBorder: 'border-slate-300 dark:border-slate-600',
    radioDot: 'border-white bg-white',
  },
  cod: {
    activeBg: 'bg-green-600', activeText: 'text-white', activeBorder: 'border-green-600',
    badgeBg: 'bg-green-600', badgeText: 'text-white',
    idleBg: 'bg-green-600', idleText: 'text-white',
    idleBorder: 'border-green-300 dark:border-green-600/60',
    radioDot: 'border-white bg-white',
  },
};

export function normalizePaymentMethod(value: string | null | undefined): PaymentMethod {
  return value === 'airtel' || value === 'card' || value === 'cod' ? value : 'mtn';
}

export function getPaymentMethodLabel(method: PaymentMethod, language: Language) {
  return LABELS[method]?.[language] ?? LABELS[method]?.en ?? '';
}

export function getPaymentMethodSubLabel(method: PaymentMethod, language: Language) {
  return SUB_LABELS[method]?.[language] ?? SUB_LABELS[method]?.en ?? '';
}

export function getPaymentMethodNote(method: PaymentMethod, language: Language) {
  return NOTES[method]?.[language] ?? NOTES[method]?.en ?? '';
}

export function isMobileMoneyPayment(method: PaymentMethod) {
  return method === 'mtn' || method === 'airtel';
}
