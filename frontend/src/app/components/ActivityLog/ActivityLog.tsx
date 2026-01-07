import React from "react";

interface UserRef {
  _id?: string;
  fullName?: string;
}

interface ActivityLogProps {
  record: {
    createdBy?: string | UserRef;
    updatedBy?: string | UserRef;
  };
}

const ActivityLog = ({ record }: ActivityLogProps) => (
  <div>
    <div>
      <span className="font-semibold">Tạo:</span>{" "}
      {typeof record.createdBy === "object" && record.createdBy?.fullName
        ? record.createdBy.fullName
        : "-"}
    </div>
    <div>
      <span className="font-semibold">Cập nhật:</span>{" "}
      {typeof record.updatedBy === "object" && record.updatedBy?.fullName
        ? record.updatedBy.fullName
        : "-"}
    </div>
  </div>
);

export default ActivityLog;
