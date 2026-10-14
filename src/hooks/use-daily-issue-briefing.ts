import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getDailyIssueBriefing } from 'src/api/board-api';

const DAY_MS = 24 * 60 * 60_000;
const SEOUL_OFFSET_MS = 9 * 60 * 60_000;

function seoulDate() {
  return new Date(Date.now() + SEOUL_OFFSET_MS).toISOString().slice(0, 10);
}

export function useDailyIssueBriefing() {
  const [date, setDate] = useState(seoulDate);

  useEffect(() => {
    const now = Date.now();
    const nextMidnight =
      (Math.floor((now + SEOUL_OFFSET_MS) / DAY_MS) + 1) * DAY_MS - SEOUL_OFFSET_MS;
    const timer = window.setTimeout(() => setDate(seoulDate()), nextMidnight - now);
    return () => window.clearTimeout(timer);
  }, [date]);

  return useQuery({
    queryKey: ['boards', 'issues', 'briefing', date],
    queryFn: () => getDailyIssueBriefing({ limit: 10 }),
    staleTime: 60_000,
    refetchInterval: 2 * 60_000,
    refetchIntervalInBackground: false,
  });
}
