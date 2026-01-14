"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PermissionForm from "@/app/components/Form/PermissionForm/PermissionForm";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function EditPermission() {
  const [form, setForm] = useState({
    key: "",
    label: "",
    group: "",
    slug: "",
  });
  const [loading, setLoading] = useState(false);
  const [allPermissions, setAllPermissions] = useState<any>({});
  let groupNames: string[] = [];
  const accessToken = localStorage.getItem("accessToken");

  const params = useParams();
  const router = useRouter();
  const { slug } = params as { slug: string };

  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles/permissions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      })
      .then((res) => {
        setAllPermissions(res.data.permissionGroups);
      });
  }, []);

  if (allPermissions) {
    groupNames = Object.keys(allPermissions);
  }

  useEffect(() => {
    if (!slug) return;
    axios
      .get(
        `http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles/permissions/detail/${slug}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      )
      .then((res) => {
        const perm = res.data.perm;
        setForm({
          key: perm.key,
          label: perm.label,
          group: perm.group,
          slug: perm.slug,
        });
      })
      .catch((err) => {
        console.log(err);
        toast.error("Không tìm thấy quyền!");
        router.back();
      });
  }, [slug, router]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
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
      slug: form.slug,
    };

    toast
      .promise(
        axios.patch(
          `http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles/permissions/edit/${slug}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        ),
        {
          pending: "Đang cập nhật quyền...",
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
              return "Cập nhật quyền thất bại";
            },
          },
        }
      )
      .finally(() => setLoading(false));
  };

  return (
    <PrivateRoute permission="edit_permission">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-xl mx-auto mt-8 bg-white p-8 rounded-xl shadow relative">
          <BackButton className="absolute -top-10 -left-70 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold mb-6 text-primary"
          >
            Chỉnh sửa quyền
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
              buttonLabel="Lưu thay đổi"
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
    </PrivateRoute>
  );
}
