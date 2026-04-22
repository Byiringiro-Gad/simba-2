import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | Simba Supermarket',
  description: 'Simba Supermarket Order Management',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
