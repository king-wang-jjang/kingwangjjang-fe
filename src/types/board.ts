export interface IPostCard {
  id: string[];
  // rank: string;
  site: string;
  title: string;
  url: string;
  createTime: Date;
  gptAnswer: string;
}

export interface IBoardFilters {
  site: string[];
}
