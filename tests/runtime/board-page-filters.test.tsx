import { test, expect, describe } from 'vitest';

import BoardPage from 'src/app/board/page';

describe('BoardPage URL filters', () => {
  test('passes tag and repeated source filters into the board workbench', async () => {
    const page = await BoardPage({
      searchParams: Promise.resolve({
        category: ' issue ',
        tag: ' AI ',
        sites: ['dcinside', ' theqoo ', 'dcinside', '', 'x'.repeat(101)],
      }),
    });

    expect(page.props).toMatchObject({
      initialCategory: 'issue',
      initialTag: 'AI',
      initialSites: ['dcinside', 'theqoo'],
    });
  });

  test('limits source filters before they reach the client component', async () => {
    const page = await BoardPage({
      searchParams: Promise.resolve({
        sites: Array.from({ length: 12 }, (_, index) => `site-${index}`),
      }),
    });

    expect(page.props.initialSites).toHaveLength(8);
  });
});
