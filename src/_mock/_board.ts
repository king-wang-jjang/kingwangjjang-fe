import type { RealtimePaginationQuery } from 'src/__generated__/graphql';

export const POSTITEMS: RealtimePaginationQuery['realtimePagination'] = [
  {
    __typename: 'Realtime',
    boardId: ['101'],
    site: 'SBS 뉴스',
    title: '제주항공 여객기 무안공항 착륙 중 추락 사고 발생',
    url: 'https://news.sbs.co.kr/news/newsHotIssue.do',
    createTime: '2025-01-29T09:07:00Z',
    gptAnswer:
      '2025년 1월 29일 오전 9시 7분, 태국 방콕발 제주항공 여객기가 전남 무안국제공항 착륙 중 추락하여 탑승객 181명 중 다수의 사상자가 발생하였습니다.',
  },
  {
    __typename: 'Realtime',
    boardId: ['102'],
    site: '연합뉴스',
    title: '충북 충주 북서쪽 규모 3.1 지진 발생',
    url: 'https://www.yna.co.kr/news',
    createTime: '2025-02-07T02:35:00Z',
    gptAnswer:
      '2025년 2월 7일 오전 2시 35분, 충북 충주시 북서쪽 22km 지역에서 규모 3.1의 지진이 발생하였으며, 현재까지 피해 상황은 확인되지 않았습니다.',
  },
  {
    __typename: 'Realtime',
    boardId: ['103'],
    site: 'KBS 뉴스',
    title: '정부, 임대차 2법 제도 개선안 공개',
    url: 'https://news.kbs.co.kr/news/pc/issue/issue.html',
    createTime: '2025-02-07T05:53:00Z',
    gptAnswer:
      '정부는 임대차 2법의 손질을 위한 연구용역 결과 보고서를 공개하였으며, 폐지보다는 개편에 무게를 두고 있습니다.',
  },
  {
    __typename: 'Realtime',
    boardId: ['104'],
    site: '한겨레',
    title: '이재명, 조기 대선 확정 시까지 기본사회위원장직 유지',
    url: 'https://www.hani.co.kr/arti/ISSUE',
    createTime: '2025-02-07T10:00:00Z',
    gptAnswer:
      '이재명 더불어민주당 대표는 조기 대선 출마가 확정될 때까지 당대표 직속 기본사회위원장직을 계속 맡을 계획입니다.',
  },
  {
    __typename: 'Realtime',
    boardId: ['105'],
    site: 'YTN',
    title: '제주 서귀포 앞바다서 어선 2척 좌초',
    url: 'https://www.ytn.co.kr/news/list.php?mcd=recentnews',
    createTime: '2025-02-01T09:30:00Z',
    gptAnswer:
      '2025년 2월 1일 오전 9시 30분경 제주 서귀포시 토끼섬 인근 바다에서 어선 2척이 좌초되어 현재 구조 작업이 진행 중입니다.',
  },
];

export const SITE_FILTER = {
  site: ['SBS 뉴스', '연합뉴스', 'KBS 뉴스', '한겨레', 'YTN'],
};
