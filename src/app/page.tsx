import { CONFIG } from 'src/config-global';
import { AppShell } from 'src/layouts/app-shell';

import { HomeView } from 'src/sections/home/view/home-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `최근 24시간 커뮤니티 동향 - ${CONFIG.appName}`,
  description:
    '여러 커뮤니티의 시간별 태그 순위 그래프, 24시간 AI 태그 통계와 일간 Top 10을 제공합니다.',
};

export default function Page() {
  return (
    <AppShell>
      <HomeView />
    </AppShell>
  );
}
