import type { Metadata } from 'next';

import { UsersView } from 'src/sections/admin/users/view/users-view';

export const metadata: Metadata = {
  title: '회원 관리 | 마약',
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return <UsersView />;
}
