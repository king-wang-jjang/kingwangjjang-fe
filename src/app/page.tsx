import { CONFIG } from 'src/config-global';
import { AppShell } from 'src/layouts/app-shell';

import { HomeView } from 'src/sections/home/view/home-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `지금 뜨는 커뮤니티 - ${CONFIG.appName}`,
  description: '실시간 커뮤니티 이슈와 오늘의 인기 순위를 한눈에 확인하세요.',
};

export default function Page() {
  return (
    <AppShell>
      <HomeView />
    </AppShell>
  );
}
