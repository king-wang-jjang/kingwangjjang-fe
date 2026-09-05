import type { Metadata } from 'next';

import { ResourcesView } from 'src/sections/admin/resources/view/resources-view';

export const metadata: Metadata = {
  title: 'AI Resource | 마약',
  robots: { index: false, follow: false },
};

export default function AdminResourcesPage() {
  return <ResourcesView />;
}
