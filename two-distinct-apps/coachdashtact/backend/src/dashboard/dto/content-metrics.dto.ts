export class RecentPostDto {
  id: string;
  title: string;
  author: string;
  publishedAt: Date;
}

export class ContentMetricsDto {
  blogPostsDraft: number;
  blogPostsPublished: number;
  blogPostsArchived: number;
  recentPosts: RecentPostDto[];
  customPagesCount: number;
  landingPagesCount: number;
}
