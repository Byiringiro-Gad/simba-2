'use client';

import Link from 'next/link';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import PickupBranchModal from '@/components/PickupBranchModal';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, isCartOpen, setCartOpen, language } = useSimbaStore();
  const t = translations[language];
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className=" min-h-screen bg-gray-50 dark:bg-gray-950\>
