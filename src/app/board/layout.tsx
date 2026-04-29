'use client';

import { AppShell } from 'src/layouts/app-shell';

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
