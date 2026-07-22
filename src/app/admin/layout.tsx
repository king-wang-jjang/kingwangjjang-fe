import { AppShell } from 'src/layouts/app-shell';

import { AdminGuard } from 'src/auth/guard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AdminGuard>{children}</AdminGuard>
    </AppShell>
  );
}
