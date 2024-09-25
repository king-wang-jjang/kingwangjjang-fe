import type { IFilterCollection } from 'src/types/board';
import type { RealtimePaginationQuery } from 'src/__generated__/graphql';

export const POSTITEMS: RealtimePaginationQuery['realtimePagination'] = [
  {
    __typename: 'RealTime',
    boardId: '1',
    rank: '1',
    site: 'Site A',
    title: 'Understanding TypeScript Generics',
    url: 'https://example.com/understanding-typescript-generics',
    createTime: '2024-08-24T14:48:00Z',
    GPTAnswer: 'Generics provide a way to create reusable components.',
  },
  {
    __typename: 'RealTime',
    boardId: '2',
    rank: '2',
    site: 'Site B',
    title: 'React Component Lifecycle Explained',
    url: 'https://example.com/react-component-lifecycle',
    createTime: '2024-08-23T10:30:00Z',
    GPTAnswer:
      "React component lifecycle methods allow you to run code at particular times in a component's existence.",
  },
  {
    __typename: 'RealTime',
    boardId: '3',
    rank: null, // Optional, can be null
    site: 'Site C',
    title: 'GraphQL vs REST: A Comparison',
    url: 'https://example.com/graphql-vs-rest',
    createTime: '2024-08-22T09:15:00Z',
    GPTAnswer: null, // Optional, can be null
  },
  {
    __typename: 'RealTime',
    boardId: '4',
    rank: '3',
    site: 'Site D',
    title: 'How to Optimize Web Performance',
    url: 'https://example.com/optimize-web-performance',
    createTime: '2024-08-21T13:45:00Z',
    GPTAnswer:
      'Optimizing web performance involves improving loading speed, reducing resource consumption, and enhancing the user experience.',
  },
  {
    __typename: 'RealTime',
    boardId: '5',
    rank: '4',
    site: 'Site E',
    title: 'Introduction to Node.js Streams',
    url: 'https://example.com/nodejs-streams',
    createTime: '2024-08-20T08:20:00Z',
    GPTAnswer: 'Node.js streams allow handling of streaming data in a more efficient way.',
  },
];

// 목업 데이터 생성
export const SITE_FILTER: IFilterCollection = {
  site: ['Site A', 'Site B'],
};
