import type { RealtimePaginationQuery } from 'src/__generated__/graphql';

export const POSTITEMS: RealtimePaginationQuery['realtimePagination'] = [
  {
    __typename: 'Realtime',
    boardId: ['1'], // 배열로 정의된 필드
    site: 'Site A',
    title: 'Understanding TypeScript Generics',
    url: 'https://example.com/understanding-typescript-generics',
    createTime: '2024-08-24T14:48:00Z',
    gptAnswer: 'Generics provide a way to create reusable components.',
  },
  {
    __typename: 'Realtime',
    boardId: ['2'],
    site: 'Site B',
    title: 'React Component Lifecycle Explained',
    url: 'https://example.com/react-component-lifecycle',
    createTime: '2024-08-23T10:30:00Z',
    gptAnswer:
      "React component lifecycle methods allow you to run code at particular times in a component's existence.",
  },
  {
    __typename: 'Realtime',
    boardId: ['3'],
    site: 'Site C',
    title: 'GraphQL vs REST: A Comparison',
    url: 'https://example.com/graphql-vs-rest',
    createTime: '2024-08-22T09:15:00Z',
    gptAnswer: null, // Optional field
  },
  {
    __typename: 'Realtime',
    boardId: ['4'],
    site: 'Site D',
    title: 'How to Optimize Web Performance',
    url: 'https://example.com/optimize-web-performance',
    createTime: '2024-08-21T13:45:00Z',
    gptAnswer:
      'Optimizing web performance involves improving loading speed, reducing resource consumption, and enhancing the user experience.',
  },
  {
    __typename: 'Realtime',
    boardId: ['5'],
    site: 'Site E',
    title: 'Introduction to Node.js Streams',
    url: 'https://example.com/nodejs-streams',
    createTime: '2024-08-20T08:20:00Z',
    gptAnswer: 'Node.js streams allow handling of streaming data in a more efficient way.',
  },
];

export const SITE_FILTER = {
  site: ['Site A', 'Site B', 'Site C'], // 사용할 사이트 필터
};
