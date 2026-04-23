'use client';

import { useEffect, useState } from 'react';
import { SimbaBranch } from '@/lib/branches';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, Clock, ExternalLink, Store } from 'lucide-react';

interface Props {
  branch: SimbaBranch | null;
  onClose: () => void;
}

export default function BranchMapModal({ branch, onClose }: Props) {
  const { language } = useSimbaStore();
  const t = translations[language];
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [walkMins, setWalkMins] = useState<number | null>(null);
  const [driveMins, setDriveMins] = useState<number | null>(null);

  // Get user location when modal opens
  useEffect(() => {
    if (!branch) return;
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        setLocating(false);

        // Haversine distance
        const R = 6371;
        const dLat = ((branch.lat - lat) * Math.PI) / 180;
        const dLng = ((branch.lng - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((branch.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        setDistanceKm(Math.round(dist * 10) / 10);
        setWalkMins(Math.round((dist / 5) * 60)); // 5 km/h walk
        setDriveMins(Math.round((dist / 30) * 60)); // 30 km/h city drive
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }, [branch?.id]);

  // Build Google Maps embed URL
  const mapSrc = branch
    ? userLat && userLng
      ? `https://www.google.com/maps/embed/v1/directions?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&origin=${userLat},${userLng}&destination=${branch.lat},${branch.lng}&mode=driving`
      : `https://www.google.com/maps/embed/v1/place?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&q=${branch.lat},${branch.lng}&zoom=16`
    : '';

  // Fallback embed (no API key needed)
  const fallbackSrc = branch
    ? userLat && userLng
      ? `https://www.google.com/maps?saddr=${userLat},${userLng}&daddr=${branch.lat},${branch.lng}&output=embed`
      : `https://maps.google.com/maps?q=${branch.lat},${branch.lng}&z=16&output=embed`
    : '';

  const directionsUrl = branch
    ? userLat && userLng
      ? `https://www.google.com/maps/dir/${userLat},${userLng}/${branch.lat},${branch.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`
    : '';

  const label = {
    en: { title: 'Branch Location', getDir: 'Get Directions', yourLoc: 'Your location', distance: 'Distance', walk: 'Walk', drive: 'Drive', locating: 'Locating you...', noLoc: 'Location unavailable', openMaps: 'Open in Google Maps' },
    fr: { title: 'Localisation de l\'agence', getDir: 'Itinéraire', yourLoc: 'Votre position', distance: 'Distance', walk: 'À pied', drive: 'En voiture', locating: 'Localisation...', noLoc: 'Position indisponible', openMaps: 'Ouvrir dans Google Maps' },
    rw: { title: 'Aho Ishami Riri', getDir: 'Reba Inzira', yourLoc: 'Aho uri', distance: 'Intera', walk: 'Gutembera', drive: 'Gutwara', locating: 'Gushaka aho uri...', noLoc: 'Aho uri ntiboneka', openMaps: 'Fungura kuri Google Maps' },
  }[language];

  return (
    <AnimatePresence>
      {branch && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full sm:max-w-2xl bg-white dark:bg-gray-950 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-brand-dark flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <p className="font-black text-white text-sm">{branch.name}</p>
                  <p className="text-white/60 text-xs">{branch.area}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Distance info bar */}
            <div className="flex items-center gap-4 px-5 py-3 bg-brand-muted dark:bg-brand/10 border-b border-brand/10 flex-shrink-0">
              {locating ? (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  {label.locating}
                </div>
              ) : distanceKm !== null ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand" />
                    <span className="text-xs font-black text-gray-900 dark:text-white">{distanceKm} km</span>
                    <span className="text-xs text-gray-400">{label.distance}</span>
                  </div>
                  <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand" />
                    <span className="text-xs font-black text-gray-900 dark:text-white">{driveMins} min</span>
                    <span className="text-xs text-gray-400">{label.drive}</span>
                  </div>
                  <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-brand" />
                    <span className="text-xs font-black text-gray-900 dark:text-white">{walkMins} min</span>
                    <span className="text-xs text-gray-400">{label.walk}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {label.noLoc}
                </div>
              )}
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-brand-dark text-white rounded-xl text-xs font-black hover:bg-gray-800 transition-colors flex-shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
                {label.openMaps}
              </a>
            </div>

            {/* Map */}
            <div className="flex-1 min-h-[320px] sm:min-h-[400px]">
              <iframe
                src={fallbackSrc}
                className="w-full h-full"
                style={{ border: 0, minHeight: 320 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={branch.name}
              />
            </div>

            {/* Pickup note */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{branch.pickupNote}</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
