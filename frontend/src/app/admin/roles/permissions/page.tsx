"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Role } from "@/app/interfaces/role.interface";
import React from "react";
import DOMPurify from "dompurify";
import { isEqual, sortBy } from "lodash";
import { toast, ToastContainer } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import NewAddButton from "@/app/components/Button/NewAddButton/NewAddButton";
import ConfirmModal from "@/app/components/ConfirmModal/ConfirmModal";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function Permission() {
  const { setUser } = useUser();

  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [originalRoles, setOriginalRoles] = useState<Role[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(true);
  const [selectedPerm, setSelectedPerm] = useState<any>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      })
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

  const fetchPermissions = () => {
    axios
      .get(`http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles/permissions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      })
      .then((res) => setPermissionGroups(res.data.permissionGroups || []))
      .catch(() => setPermissionGroups([]));
  };

  useEffect(() => {
    fetchPermissions();
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
        { roles },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
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

  const handleDeletePermission = (perm: any) => {
    setSelectedPerm(perm);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPerm) return;
    try {
      await axios.patch(
        `http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles/permissions/delete/${selectedPerm._id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      toast.success("Xóa quyền thành công!");
      fetchPermissions();
    } catch {
      toast.error("Xóa quyền thất bại!");
    } finally {
      setDeleteModalOpen(false);
      setSelectedPerm(null);
    }
  };

  return (
    <>
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen flex items-center justify-center"
        >
          <div className="text-xl text-gray-500">Đang tải...</div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[32px] font-bold m-0 mb-2 text-primary">
            🛡️ Phân quyền
          </h1>
          <div className="text-right mb-4">
            <NewAddButton label="Thêm mới" source="roles/permissions" />
          </div>
          <motion.div
            key={hidden ? "table-hidden" : "table-visible"}
            initial={{ y: 30 }}
            animate={{ y: 0 }}
            exit={{ y: 30 }}
            transition={{ duration: 0.4 }}
            className="overflow-x-auto rounded-2xl bg-white shadow p-4"
          >
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-[#F7F9FB]">
                  <th className="py-3 px-4 text-left text-[15px] font-semibold text-primary min-w-55">
                    Nhóm quyền
                  </th>
                  {roles.map((role, index) => (
                    <th
                      key={index}
                      className="py-3 px-4 text-center text-[15px] font-semibold text-primary min-w-30"
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
                        <td className="py-3 px-4 flex items-center text-[14px] text-gray-800 border-b border-gray-100">
                          {perm.label}
                          <button
                            className="ml-2 text-blue-500 hover:underline cursor-pointer text-xs"
                            onClick={() =>
                              router.push(
                                `/${ADMIN_PREFIX}/roles/permissions/edit/${perm.slug}`
                              )
                            }
                          >
                            Sửa
                          </button>
                          <button
                            className="ml-2 text-red-500 hover:underline cursor-pointer text-xs"
                            onClick={() => handleDeletePermission(perm)}
                          >
                            Xóa
                          </button>
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
          </motion.div>
          <motion.div
            className="mb-5 text-right"
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatePresence>
              {!hidden && (
                <motion.button
                  key="save-btn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="py-3 px-6 mt-[20px] bg-secondary1 transition-colors duration-200 text-white rounded-lg text-[16px] font-semibold cursor-pointer hover:bg-blue-600 p-[10px]"
                  onClick={handleSave}
                >
                  Lưu thay đổi
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
          <ToastContainer
            autoClose={1500}
            hideProgressBar={true}
            pauseOnHover={false}
          />
        </motion.div>
      )}
      <ConfirmModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={
          selectedPerm
            ? `Bạn có chắc muốn xóa quyền "${selectedPerm.label}"?`
            : ""
        }
        label="Xóa"
      />
    </>
  );
}
