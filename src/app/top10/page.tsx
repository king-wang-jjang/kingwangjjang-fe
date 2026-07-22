import { CONFIG } from 'src/config-global';

import { Top10View } from 'src/sections/top10/view/top10-view';

export const metadata = { title: `일간 TOP 10 - ${CONFIG.appName}` };

type PageProps = {
  searchParams: Promise<{ rank?: string | string[] }>;
};

function parseRank(value: string | string[] | undefined): number | undefined {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 10 ? parsed : undefined;
}

export default async function Page({ searchParams }: PageProps) {
  const { rank } = await searchParams;
  return <Top10View initialExpandedRank={parseRank(rank)} />;
}
