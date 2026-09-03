import { CONFIG } from 'src/config-global';

import { BoardView } from '../../sections/board/view/board-view';

export const metadata = { title: `실시간 인기 - ${CONFIG.appName}` };

type PageProps = {
  searchParams: Promise<{
    category?: string | string[];
    tag?: string | string[];
  }>;
};

function parseFilter(value: string | string[] | undefined) {
  const filter = (Array.isArray(value) ? value[0] : value)?.trim();
  return filter && filter.length <= 100 ? filter : undefined;
}

export default async function Page({ searchParams }: PageProps) {
  const { category, tag } = await searchParams;
  return <BoardView initialCategory={parseFilter(category)} initialTag={parseFilter(tag)} />;
}
