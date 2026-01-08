"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useParams } from "next/navigation";
import { BackButton } from "@/app/components/BackButton/BackButton";
import { motion, AnimatePresence } from "framer-motion";
import AccountForm from "@/app/components/AccountForm/AccountForm";
import { Role } from "@/app/interfaces/role.interface";
import { useRouter } from "next/navigation";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX ?? "admin";

export default function EditBook() {
  const params = useParams();
  const slug = params.slug;
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "active",
    role_id: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const fileInputRef = useRef<any>(null);

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles`, {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
        withCredentials: true,
      })
      .then((res) => setRoles(res.data.roles || []))
      .catch(() => setRoles([]));
  }, []);

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

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/v1/${ADMIN_PREFIX}/accounts/detail/${params.slug}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );
        const account = res.data.account;
        console.log(account);
        setForm({
          fullName: account.fullName,
          email: account.email,
          phone: account.phone,
          status: account.status,
          role_id: account.role_id._id,
          avatar: account.avatar,
        });
        setPreview(account.avatar || null);
      } catch (err) {
        toast.error("Không tìm thấy tài khoản!");
        router.back();
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchAccount();
  }, [params.slug]);

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
        axios.patch(
          `http://localhost:3001/api/v1/${ADMIN_PREFIX}/accounts/edit/${slug}`,
          formData,
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
              return "Cập nhật sách thất bại";
            },
          },
        }
      )
      .finally(() => setLoading(false));
  };

  return (
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
            Chỉnh sửa sách
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <AccountForm
              form={form}
              loading={loading}
              preview={preview}
              setPreview={setPreview}
              imageFile={imageFile}
              setImageFile={setImageFile}
              fileInputRef={fileInputRef}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
              handleImageChange={handleImageChange}
              handleRemoveImage={handleRemoveImage}
              buttonLabel="Cập nhật"
              roles={roles}
              showPasswordField={false}
            />

            <button
              type="button"
              className=" transition-colors duration-200 bg-[#979797] cursor-pointer hover:bg-[#676767] text-white px-2 py-2 rounded font-semibold mt-4"
              onClick={() =>
                router.push(`/admin/accounts/reset-password/${slug}`)
              }
            >
              Reset mật khẩu
            </button>
          </motion.div>

          <ToastContainer
            autoClose={1500}
            hideProgressBar={true}
            pauseOnHover={false}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
