import { CONFIG } from 'src/config-global';

import { BoardView } from '../../sections/board/view/board-view';

export const metadata = { title: `실시간 인기 - ${CONFIG.appName}` };

type PageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

function parseCategory(value: string | string[] | undefined) {
  const category = (Array.isArray(value) ? value[0] : value)?.trim();
  return category && category.length <= 100 ? category : undefined;
}

export default async function Page({ searchParams }: PageProps) {
  const { category } = await searchParams;
  return <BoardView initialCategory={parseCategory(category)} />;
}
