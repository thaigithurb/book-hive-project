export interface UserRef {
  _id: string;
  fullName: string;
}

export interface Account {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  avatar?: string;
  status: string;
  deleted: boolean;
  deletedAt?: Date | null;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: UserRef;
  deletedBy: UserRef;
  updatedBy: UserRef;
}
