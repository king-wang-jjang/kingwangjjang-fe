import { CONFIG } from 'src/config-global';

import { Top10View } from 'src/sections/top10/view/top10-view';

export const metadata = { title: `오늘의 TOP 10 - ${CONFIG.appName}` };

export default function Page() {
  return <Top10View />;
}
