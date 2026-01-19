"use client";

import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import CategoryForm from "@/app/components/Form/CategoryForm/CategoryForm";
import { motion } from "framer-motion";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Create() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    position: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const accessToken = localStorage.getItem("accessToken_admin");

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
      title: form.title,
      description: form.description,
      position: form.position ? Number(form.position) : undefined,
      status: form.status,
    };

    toast
      .promise(
        axios.post(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/categories/create`,
          data,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        ),
        {
          pending: "Đang tạo thể loại...",
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
              return "Tạo thể loại thất bại";
            },
          },
        }
      )
      .then(() => {
        setForm({
          title: "",
          description: "",
          position: "",
          status: "active",
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <PrivateRoute permission="create_category">
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
            Tạo mới thể loại
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
              buttonLabel="Tạo mới"
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
