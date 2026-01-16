"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import RoleForm from "@/app/components/Form/RoleForm/RoleForm";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditRole() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const [form, setForm] = useState({
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const accessToken = localStorage.getItem("accessToken");

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/roles/detail/${slug}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );
        const role = res.data.role;
        setForm({
          title: role.title,
          description: role.description,
        });
      } catch (err) {
        toast.error("Không tìm thấy vai trò!");
        router.back();
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchRole();
  }, [slug]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      title: form.title,
      description: form.description,
    };

    toast
      .promise(
        axios.patch(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/roles/edit/${slug}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        ),
        {
          pending: "Đang cập nhật...",
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
              return "Cập nhật vai trò thất bại";
            },
          },
        }
      )
      .finally(() => setLoading(false));
  };

  return (
    <>
      <PrivateRoute permission="edit_role">
        <AnimatePresence mode="wait">
          {isPageLoading ? (
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
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-xl shadow relative"
            >
              <BackButton className="absolute -top-10 -left-60 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />

              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-2xl font-bold mb-6 text-primary"
              >
                Chỉnh sửa thể loại
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <RoleForm
                  form={form}
                  loading={loading}
                  handleSubmit={handleSubmit}
                  handleChange={handleChange}
                  buttonLabel="Cập nhật"
                />
              </motion.div>

              <ToastContainer
                autoClose={1500}
                hideProgressBar={true}
                pauseOnHover={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </PrivateRoute>
    </>
  );
}
