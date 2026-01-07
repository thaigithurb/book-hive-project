"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { BackButton } from "@/app/components/BackButton/BackButton";
import { motion } from "framer-motion";
import PermissionForm from "@/app/components/PermissionForm/PermissionForm";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function CreatePermission() {
  const [form, setForm] = useState({
    key: "",
    label: "",
    group: "",
  });
  const [loading, setLoading] = useState(false);
  const [allPermissions, setAllPermissions] = useState<Permissions[]>([]);
  const accessToken = localStorage.getItem("accessToken");

  let groupNames: string[] = [];

  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles/permissions`)
      .then((res) => {
        setAllPermissions(res.data.permissionGroups);
      });
  }, []);

  if (allPermissions) {
    groupNames = Object.keys(allPermissions);
  }

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      key: form.key,
      label: form.label,
      group: form.group,
    };

    toast
      .promise(
        axios.post(
          `http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles/permissions/create`,
          data,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        ),
        {
          pending: "Đang tạo quyền...",
          success: {
            render({ data }) {
              return data?.data?.message;
            },
          },
          error: {
            render({ data }) {
              if (axios.isAxiosError(data)) {
                return data.response?.data?.message;
              }
              return "Tạo quyền thất bại";
            },
          },
        }
      )
      .then(() => {
        setForm({
          key: "",
          label: "",
          group: "",
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-xl mx-auto mt-8 bg-white p-8 rounded-xl shadow relative">
        <BackButton className="absolute -top-10 -left-90 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl font-bold mb-6 text-primary"
        >
          Tạo mới quyền
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <PermissionForm
            form={form}
            loading={loading}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
            buttonLabel="Tạo mới"
            groupOptions={groupNames}
          />
        </motion.div>
        <ToastContainer
          autoClose={1500}
          hideProgressBar={true}
          pauseOnHover={false}
        />
      </div>
    </motion.div>
  );
}
