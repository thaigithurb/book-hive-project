"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import BookForm from "@/app/components/Form/BookForm/BookForm";
import { motion, AnimatePresence } from "framer-motion";
import CategoryForm from "@/app/components/Form/CategoryForm/CategoryForm";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function EditCategory() {
  const params = useParams();
  const slug = params.slug;
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    position: "",
    status: "active",
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
    const fetchCategory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/v1/${ADMIN_PREFIX}/categories/${params.slug}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );
        const category = res.data.category;
        setForm({
          title: category.title,
          description: category.description,
          position: category.position,
          status: category.status,
        });
      } catch (err) {
        toast.error("Không tìm thấy thể loại!");
        router.back();
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchCategory();
  }, [params.slug]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      title: form.title,
      description: form.description,
      position: form.position ? Number(form.position) : undefined,
      status: form.status,
    };

    toast
      .promise(
        axios.patch(
          `http://localhost:3001/api/v1/${ADMIN_PREFIX}/categories/edit/${slug}`,
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
              return "Cập nhật thể loại thất bại";
            },
          },
        }
      )
      .finally(() => setLoading(false));
  };

  return (
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
              <CategoryForm
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
  );
}
