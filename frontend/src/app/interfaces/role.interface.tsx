export interface UserRef {
  _id: string;
  fullName: string;
}

export interface Role {
  title: string;
  description: string;
  permissions: string[];
  deleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  slug: string;
  _id: string;
  createdBy: UserRef;
  deletedBy: UserRef;
  updatedBy: UserRef;
}
