import type { Metadata } from 'next';

import { ShortsView } from 'src/sections/admin/shorts/view/shorts-view';

export const metadata: Metadata = {
  title: 'Shorts Studio | Kingwangjjang',
  robots: { index: false, follow: false },
};

export default function AdminShortsPage() {
  return <ShortsView />;
}
