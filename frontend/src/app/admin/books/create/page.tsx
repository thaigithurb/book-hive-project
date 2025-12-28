"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { BackButton } from "@/app/components/BackButton/BackButton";
import BookForm from "@/app/components/BookForm/BookForm";
import { motion } from "framer-motion";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function Create() {
  const [form, setForm] = useState({
    title: "",
    author: "",
    category_id: "",
    description: "",
    priceBuy: "",
    priceRent: "",
    position: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const fileInputRef = useRef<any>(null);

  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/v1/${ADMIN_PREFIX}/categories`)
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  const handleMoneyChange = (e: any) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/^0+/, "");
    setForm((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setImageFile(file);
    } else {
      setPreview(null);
      setImageFile(null);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    toast
      .promise(
        axios.post(
          `http://localhost:3001/api/v1/${ADMIN_PREFIX}/books/create`,
          formData
        ),
        {
          pending: "Đang tạo sách...",
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
              return "Tạo sách thất bại";
            },
          },
        }
      )
      .then(() => {
        setForm({
          title: "",
          author: "",
          category_id: "",
          description: "",
          priceBuy: "",
          priceRent: "",
          position: "",
          status: "active",
        });
        setPreview(null);
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
          Tạo mới sách
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <BookForm
            form={form}
            setForm={setForm}
            loading={loading}
            preview={preview}
            setPreview={setPreview}
            imageFile={imageFile}
            setImageFile={setImageFile}
            fileInputRef={fileInputRef}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
            handleMoneyChange={handleMoneyChange}
            handleImageChange={handleImageChange}
            handleRemoveImage={handleRemoveImage}
            buttonLabel="Tạo mới"
            categories={categories}
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