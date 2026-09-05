import { CONFIG } from 'src/config-global';

import { BoardView } from '../../sections/board/view/board-view';

export const metadata = { title: `실시간 인기 - ${CONFIG.appName}` };

type PageProps = {
  searchParams: Promise<{
    category?: string | string[];
    tag?: string | string[];
    sites?: string | string[];
  }>;
};

function parseFilter(value: string | string[] | undefined) {
  const filter = (Array.isArray(value) ? value[0] : value)?.trim();
  return filter && filter.length <= 100 ? filter : undefined;
}

function parseFilters(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return Array.from(
    new Set(values.map((item) => item.trim()).filter((item) => item && item.length <= 100))
  ).slice(0, 8);
}

export default async function Page({ searchParams }: PageProps) {
  const { category, tag, sites } = await searchParams;
  return (
    <BoardView
      initialCategory={parseFilter(category)}
      initialTag={parseFilter(tag)}
      initialSites={parseFilters(sites)}
    />
  );
}
