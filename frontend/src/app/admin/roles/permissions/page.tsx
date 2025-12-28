"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Role } from "@/app/interfaces/role.interface";
import React from "react";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function Permission() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles`)
      .then((res) => {
        setRoles(res.data.roles || []);
      })
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles/permissions`)
      .then((res) => setPermissions(res.data.permissions || []))
      .catch(() => setPermissions([]));
  }, []);

  const permissionGroups = permissions.reduce((acc: any, perm: any) => {
    if (!acc[perm.group]) acc[perm.group] = [];
    acc[perm.group].push(perm);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <>
      <h1 className="text-[32px] font-bold m-0 mb-[8px] text-primary">🛡️ Phân quyền</h1>
      <div className="overflow-x-auto rounded-2xl bg-white shadow p-4">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-[#F7F9FB]">
              <th className="py-3 px-4 text-left text-[15px] font-semibold text-primary min-w-[220px]">
                Nhóm quyền
              </th>
              {roles.map((role, index) => (
                <th
                  key={index}
                  className="py-3 px-4 text-center text-[15px] font-semibold text-primary min-w-[120px]"
                >
                  <div className="flex flex-col items-center">
                    <span>{role.title}</span>
                    <span className="text-xs text-gray-400 font-normal mt-1">
                      {role.description}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(permissionGroups).map(([groupLabel, perms]) => (
              <React.Fragment key={groupLabel}>
                <tr>
                  <td
                    colSpan={roles.length + 1}
                    className="py-2 px-4 text-[14px] font-semibold text-blue-700 bg-[#F0F6FF] border-t border-b border-blue-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-700">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                      {groupLabel}
                    </div>
                  </td>
                </tr>
                {(perms as any[]).map((perm: any) => (
                  <tr key={perm.key}>
                    <td className="py-3 px-4 text-[14px] text-gray-800 border-b border-gray-100">
                      {perm.label}
                    </td>
                    {roles.map((role) => (
                      <td key={role.title} className="text-center">
                        <input
                          type="checkbox"
                          checked={role.permissions.includes(perm.key)}
                          readOnly
                          className="accent-blue-500 w-5 h-5 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
