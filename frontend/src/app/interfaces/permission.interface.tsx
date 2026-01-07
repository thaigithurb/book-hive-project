export interface UserRef {
  _id: string;
  fullName: string;
}

interface Permission {
  key: string;
  label: string;
  _id?: string;
  group?: string;
  createdBy: UserRef;
  deletedBy: UserRef;
  updatedBy: UserRef;
}
