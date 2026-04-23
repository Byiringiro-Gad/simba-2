export interface SimbaBranch {
  id: string;
  name: string;
  area: string;
  pickupNote: string;
  lat: number;
  lng: number;
}

export const SIMBA_BRANCHES: SimbaBranch[] = [
  {
    id: 'remera',
    name: 'Simba Supermarket Remera',
    area: 'Remera, Kigali',
    pickupNote: 'Busy branch with quick prep for commuter pickups.',
    lat: -1.9536,
    lng: 30.1127,
  },
  {
    id: 'kimironko',
    name: 'Simba Supermarket Kimironko',
    area: 'Kimironko, Kigali',
    pickupNote: 'Convenient for market-side pickup and evening collections.',
    lat: -1.9270,
    lng: 30.1020,
  },
  {
    id: 'kacyiru',
    name: 'Simba Supermarket Kacyiru',
    area: 'Kacyiru, Kigali',
    pickupNote: 'Central option for office and embassy district pickups.',
    lat: -1.9380,
    lng: 30.0712,
  },
  {
    id: 'nyamirambo',
    name: 'Simba Supermarket Nyamirambo',
    area: 'Nyamirambo, Kigali',
    pickupNote: 'Popular neighborhood branch for same-day collections.',
    lat: -1.9780,
    lng: 30.0420,
  },
  {
    id: 'gikondo',
    name: 'Simba Supermarket Gikondo',
    area: 'Gikondo, Kigali',
    pickupNote: 'Practical branch for south-side pickups and bulk baskets.',
    lat: -1.9700,
    lng: 30.0650,
  },
  {
    id: 'kanombe',
    name: 'Simba Supermarket Kanombe',
    area: 'Kanombe, Kigali',
    pickupNote: 'Good airport-side option for fast in-and-out pickup.',
    lat: -1.9690,
    lng: 30.1390,
  },
  {
    id: 'kinyinya',
    name: 'Simba Supermarket Kinyinya',
    area: 'Kinyinya, Kigali',
    pickupNote: 'Reliable branch for residential pickup windows.',
    lat: -1.9050,
    lng: 30.0980,
  },
  {
    id: 'kibagabaga',
    name: 'Simba Supermarket Kibagabaga',
    area: 'Kibagabaga, Kigali',
    pickupNote: 'Best suited for north-east Kigali customer pickups.',
    lat: -1.9310,
    lng: 30.0890,
  },
  {
    id: 'nyanza',
    name: 'Simba Supermarket Nyanza',
    area: 'Nyanza, Kigali',
    pickupNote: 'Smooth pickup option for the Nyanza side of Kigali.',
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

