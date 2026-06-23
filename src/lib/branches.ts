export interface SimbaBranch {
  id: string;
  name: string;
  area: string;
  address: string;
  pickupNote: string;
  hours: string;
  hoursNote?: string;
  mapsUrl: string;
  lat: number;
  lng: number;
}

export const SIMBA_BRANCHES: SimbaBranch[] = [
  {
    id: 'centenary',
    name: 'Simba Supermarket Centenary',
    area: 'Centenary House, Kigali City Centre',
    address: 'Centenary House, KN 4 Ave, Kigali',
    pickupNote: 'Flagship city-centre branch. Ideal for office and city pickup.',
    hours: 'Mon–Sat 08:00–21:00 · Sun 09:00–18:00',
    mapsUrl: 'https://maps.google.com/?q=Centenary+House+KN+4+Ave+Kigali',
    lat: -1.9441,
    lng: 30.0588,
  },
  {
    id: 'kigali-heights',
    name: 'Simba Supermarket Kigali Heights',
    area: 'Kigali Heights, Kimihurura',
    address: 'Kigali Heights, KG 7 Ave, Kimihurura, Kigali',
    pickupNote: 'Modern mall branch in the heart of Kimihurura.',
    hours: 'Mon–Sat 08:00–21:00 · Sun 09:00–18:00',
    mapsUrl: 'https://maps.google.com/?q=Kigali+Heights+KG+7+Ave+Kimihurura',
    lat: -1.9362,
    lng: 30.0901,
  },
  {
    id: 'gisozi',
    name: 'Simba Supermarket Gisozi',
    area: 'Gisozi, Gasabo District',
    address: 'KG 11 Ave, Gisozi, Gasabo, Kigali',
    pickupNote: 'Convenient branch for the Gisozi residential area.',
    hours: 'Mon–Sat 08:00–21:00 · Sun 09:00–18:00',
    mapsUrl: 'https://maps.google.com/?q=Gisozi+Gasabo+Kigali',
    lat: -1.9230,
    lng: 30.0720,
  },
  {
    id: 'remera',
    name: 'Simba Supermarket Remera',
    area: 'Remera, Gasabo District',
    address: 'KG 9 Ave, Remera, Gasabo, Kigali',
    pickupNote: 'Busy commuter branch near Remera market.',
    hours: 'Mon–Sat 08:00–21:00 · Sun 09:00–18:00',
    mapsUrl: 'https://maps.google.com/?q=Simba+Supermarket+Remera+Kigali',
    lat: -1.9536,
    lng: 30.1127,
  },
  {
    id: 'kimironko',
    name: 'Simba Supermarket Kimironko',
    area: 'Kimironko, Gasabo District',
    address: 'KG 15 Ave, Kimironko, Gasabo, Kigali',
    pickupNote: 'Convenient for market-side pickup and evening collections.',
    hours: 'Mon–Sat 08:00–21:00 · Sun 09:00–18:00',
    mapsUrl: 'https://maps.google.com/?q=Simba+Supermarket+Kimironko+Kigali',
    lat: -1.9270,
    lng: 30.1020,
  },
  {
    id: 'kacyiru',
    name: 'Simba Supermarket Kacyiru',
    area: 'Kacyiru, Gasabo District',
    address: 'KG 3 Ave, Kacyiru, Gasabo, Kigali',
    pickupNote: 'Central option for office and embassy district pickups.',
    hours: 'Mon–Sat 08:00–21:00 · Sun 09:00–18:00',
    mapsUrl: 'https://maps.google.com/?q=Simba+Supermarket+Kacyiru+Kigali',
    lat: -1.9380,
    lng: 30.0712,
  },
  {
    id: 'nyamirambo',
    name: 'Simba Supermarket Nyamirambo',
    area: 'Nyamirambo, Nyarugenge District',
    address: 'KN 18 Ave, Nyamirambo, Nyarugenge, Kigali',
    pickupNote: 'Popular neighbourhood branch for same-day collections.',
    hours: 'Mon–Sat 08:00–21:00 · Sun 09:00–18:00',
    mapsUrl: 'https://maps.google.com/?q=Simba+Supermarket+Nyamirambo+Kigali',
    lat: -1.9780,
    lng: 30.0420,
  },
  {
    id: 'gikondo',
    name: 'Simba Supermarket Gikondo',
    area: 'Gikondo, Kicukiro District',
    address: 'KK 19 Ave, Gikondo, Kicukiro, Kigali',
    pickupNote: 'Practical branch for south-side pickups and bulk baskets.',
    hours: 'Mon–Sat 08:00–21:00 · Sun 09:00–18:00',
    mapsUrl: 'https://maps.google.com/?q=Simba+Supermarket+Gikondo+Kigali',
    lat: -1.9700,
    lng: 30.0650,
  },
  {
    id: 'kanombe',
    name: 'Simba Supermarket Kanombe',
    area: 'Kanombe, Kicukiro District',
    address: 'KK 15 Ave, Kanombe, Kicukiro, Kigali',
    pickupNote: 'Airport-side option for fast in-and-out pickup.',
    hours: 'Mon–Sat 08:00–21:00 · Sun 09:00–18:00',
    mapsUrl: 'https://maps.google.com/?q=Simba+Supermarket+Kanombe+Kigali',
    lat: -1.9690,
    lng: 30.1390,
  },
  {
    id: 'kinyinya',
    name: 'Simba Supermarket Kinyinya',
    area: 'Kinyinya, Gasabo District',
    address: 'KG 30 Ave, Kinyinya, Gasabo, Kigali',
    pickupNote: 'Reliable branch for residential north Kigali pickup.',
    hours: 'Mon–Sat 08:00–21:00 · Sun 09:00–18:00',
    mapsUrl: 'https://maps.google.com/?q=Simba+Supermarket+Kinyinya+Kigali',
    lat: -1.9050,
    lng: 30.0980,
  },
  {
    id: 'kibagabaga',
    name: 'Simba Supermarket Kibagabaga',
    area: 'Kibagabaga, Gasabo District',
    address: 'KG 11 Ave, Kibagabaga, Gasabo, Kigali',
    pickupNote: 'Best suited for north-east Kigali customer pickups.',
    hours: 'Mon–Sat 08:00–21:00 · Sun 09:00–18:00',
    mapsUrl: 'https://maps.google.com/?q=Simba+Supermarket+Kibagabaga+Kigali',
    lat: -1.9310,
    lng: 30.0890,
  },
  {
    id: 'nyanza',
    name: 'Simba Supermarket Nyanza',
    area: 'Nyanza, Southern Province',
    address: 'RN1, Nyanza, Southern Province, Rwanda',
    pickupNote: 'Serves the Nyanza and southern Kigali region.',
    hours: 'Daily 08:00–20:00',
    hoursNote: 'Closes one hour earlier than other branches.',
    mapsUrl: 'https://maps.google.com/?q=Nyanza+Southern+Province+Rwanda',
    lat: -2.3500,
    lng: 29.7400,
  },
];

export type PickupSlotId = 'asap' | 'morning' | 'afternoon' | 'evening';

export const PICKUP_SLOTS: Array<{
  id: PickupSlotId;
  label: string;
  window: string;
  icon: string;
}> = [
  { id: 'asap', label: 'Soonest', window: '20-45 min', icon: '⚡' },
  { id: 'morning', label: 'Morning', window: '8am-12pm', icon: '🌤' },
  { id: 'afternoon', label: 'Afternoon', window: '12pm-5pm', icon: '☀️' },
  { id: 'evening', label: 'Evening', window: '5pm-9pm', icon: '🌙' },
];

export const PICKUP_DEPOSIT_RWF = 500;

export function getBranchById(branchId: string | null | undefined) {
  if (!branchId) return null;
  return SIMBA_BRANCHES.find((branch) => branch.id === branchId) ?? null;
}

