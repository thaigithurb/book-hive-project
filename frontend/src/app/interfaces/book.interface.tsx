export interface Book {
  title: string;
  author: string;
  category_id: string;
  category_name: string;
  description: string;
  priceBuy: number;
  priceRent: number;
  rating: number;
  reviews: number;
  image: string;
  status: string;
  position: number;
  deleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  slug: string;
  _id: string; 
  createdBy: string;
  deletedBy: string;
  updatedBy: string
}