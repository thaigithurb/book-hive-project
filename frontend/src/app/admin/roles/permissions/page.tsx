"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Role } from "@/app/interfaces/role.interface";
import React from "react";
import DOMPurify from "dompurify";
import { isEqual, sortBy } from "lodash";
import { toast, ToastContainer } from "react-toastify";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function Permission() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [originalRoles, setOriginalRoles] = useState<Role[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles`)
      .then((res) => {
        setRoles(res.data.roles || []);
        setOriginalRoles(res.data.roles || []);
      })
      .catch(() => {
        setRoles([]);
        setOriginalRoles([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles/permissions`)
      .then((res) => setPermissionGroups(res.data.permissionGroups || []))
      .catch(() => setPermissionGroups([]));
  }, []);

  const handleChange = (roleIndex: number, permKey: any) => {
    setRoles((prev) =>
      prev.map((role, index) => {
        if (index !== roleIndex) return role;
        const checked = !role.permissions.includes(permKey);
        return {
          ...role,
          permissions: checked
            ? [...role.permissions, permKey]
            : role.permissions.filter((k) => k !== permKey),
        };
      })
    );
  };

  const normalizeRoles = (roles: Role[]) => {
    return roles.map((role) => ({
      ...role,
      permissions: sortBy(role.permissions),
    }));
  };

  useEffect(() => {
    if (isEqual(normalizeRoles(roles), normalizeRoles(originalRoles))) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [roles, originalRoles]);

  const handleSave = async () => {
    try {
      await axios.patch(
        `http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles/permissions/edit`,
        { roles }
      );
      setOriginalRoles(
        roles.map((role) => ({
          ...role,
          permissions: sortBy(role.permissions),
        }))
      );
      setHidden(true);
      toast.success("Cập nhật quyền thành công!");
    } catch (err) {
      toast.error("Cập nhật quyền không thành công!");
    }
  };

  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <>
      <h1 className="text-[32px] font-bold m-0 mb-[8px] text-primary">
        🛡️ Phân quyền
      </h1>
      <div className="mb-[20px] text-right">
        <button
          className={`py-3 px-6 bg-secondary1 transition-colors duration-200 text-white rounded-[8px] text-[16px] font-semibold cursor-pointer hover:bg-blue-600 p-[10px]${
            hidden ? " hidden" : ""
          }`}
          onClick={handleSave}
        >
          Lưu thay đổi
        </button>
      </div>
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
                    <span
                      className="text-xs text-gray-400 font-normal mt-1"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(role.description),
                      }}
                    ></span>
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
                    {roles.map((role, index) => (
                      <td key={role.title} className="text-center">
                        <input
                          onChange={() => handleChange(index, perm.key)}
                          type="checkbox"
                          checked={role.permissions.includes(perm.key)}
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
      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </>
  );
}
