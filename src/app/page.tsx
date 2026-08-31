import { CONFIG } from 'src/config-global';
import { AppShell } from 'src/layouts/app-shell';

import { HomeView } from 'src/sections/home/view/home-view';

// ----------------------------------------------------------------------

export const metadata = { title: `실시간 이슈 맵 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <AppShell>
      <HomeView />
    </AppShell>
  );
}
