import { CONFIG } from 'src/config-global';

import { BoardView } from '../../sections/board/view/board-view';

export const metadata = { title: `실시간 인기 - ${CONFIG.appName}` };

export default function Page() {
  return <BoardView />;
}
