"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import PermissionTable from "@/app/components/RoleTable/PermissionTablel";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function Roles() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const router = useRouter();


  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles`)
      .then((res) => setRoles(res.data.roles || []))
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-[32px] font-bold m-0 text-primary">🔑 Nhóm quyền</h1>
      <div className="flex justify-end mb-4">
        <button
           className="py-3 px-6 bg-secondary1 transition-colors duration-200 text-white rounded-[8px] text-[16px] font-semibold cursor-pointer hover:bg-blue-600"
          onClick={() => router.push(`/${ADMIN_PREFIX}/roles/create`)}
        >
          ➕ Thêm vai trò mới
        </button>
      </div>
      <div className="bg-white rounded-xl shadow">
        <PermissionTable roles={roles} />
      </div>
    </div>
  );
}