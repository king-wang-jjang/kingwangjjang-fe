import { CONFIG } from 'src/config-global';
import { AppShell } from 'src/layouts/app-shell';

import { HomeView } from 'src/sections/home/view/home-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `AI 태그로 읽는 커뮤니티 - ${CONFIG.appName}`,
  description: 'AI가 분석한 커뮤니티 태그 흐름과 오늘의 인기 글을 한눈에 확인하세요.',
};

export default function Page() {
  return (
    <AppShell>
      <HomeView />
    </AppShell>
  );
}
