export interface IBlog {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  isVisible: boolean;
  mainBlog: boolean;
  viewCount: number;
  createdAt: string;
}

export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isVisible?: boolean;
  mainBlog?: boolean;
}
