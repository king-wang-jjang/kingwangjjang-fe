export interface IPostCard {
  id: string;
  rank: string;
  site: string;
  title: string;
  url: string;
  createTime: Date;
  GPTAnswer: string;
}

export interface IFilterCollection {
  site: string[];
}
