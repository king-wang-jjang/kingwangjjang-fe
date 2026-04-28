'use client';

import { DashboardLayout } from 'src/layouts/dashboard';

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
