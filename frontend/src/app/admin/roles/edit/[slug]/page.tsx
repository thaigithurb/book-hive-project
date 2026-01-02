"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { BackButton } from "@/app/components/BackButton/BackButton";
import { AnimatePresence, motion } from "framer-motion";
import { useParams } from "next/navigation";
import RoleForm from "@/app/components/RoleForm/RoleForm";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function EditRole() {
  const params = useParams();
  const slug = params.slug;

  const [form, setForm] = useState({
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

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
          `http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles/${params.slug}`
        );
        const role = res.data.role;
        setForm({
          title: role.title,
          description: role.description,
        });
      } catch (err) {
        toast.error("Không tìm thấy thể loại!");
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchRole();
  }, [params.slug]);

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
          `http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles/edit/${slug}`,
          data
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
            <BackButton className="absolute -top-10 -left-80 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />

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
                setForm={setForm}
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
    </>
  );
}
