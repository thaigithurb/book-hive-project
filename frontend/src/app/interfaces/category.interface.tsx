export interface Category {
  _id: string;
  title: string;
  parent_id: string;
  description: string;
  thumbnail?: string;
  status: string;
  deleted: boolean;
  deletedAt: Date;
  slug: string;
  position: number;
}