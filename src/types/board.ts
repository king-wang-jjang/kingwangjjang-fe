export interface IPostCard {
  id: string[];
  // rank: string;
  site: string;
  title: string;
  url: string;
  thumbnail: string;
  createTime: Date;
  gptAnswer: string;
  commentCount: number;
}

export interface IBoardFilters {
  site: string[];
}
