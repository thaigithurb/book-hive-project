"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { Loading } from "@/app/components/Loading/Loading";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 3 ký tự"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^0\d{9,10}$/.test(val),
      "Số điện thoại không hợp lệ",
    ),
});

export default function EditProfilePage() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const router = useRouter();
  const accessToken = localStorage.getItem("accessToken_user");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/v1/users/me`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        withCredentials: true,
      })
      .then((res) => {
        setForm({
          fullName: res.data.user.fullName || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
        });
      })
      .catch(() => {
        toast.error("Không lấy được thông tin người dùng");
        router.replace("/profile");
      })
      .finally(() => setIsPageLoading(false));
  }, [router]);

  const handleChange = (e: any) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrors({});
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: { [k: string]: string } = {};
      result.error.issues.forEach((err) => {
        if (typeof err.path[0] === "string")
          fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    toast
      .promise(
        axios.patch(
          `${API_URL}/api/v1/users/edit`,
          { fullName: form.fullName, phone: form.phone },
          {
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : {},
            withCredentials: true,
          },
        ),
        {
          pending: "Đang cập nhật...",
          success: {
            render({ data }) {
              return data?.data?.message || "Cập nhật thành công!";
            },
          },
          error: {
            render({ data }) {
              if (axios.isAxiosError(data)) {
                return data.response?.data?.message || "Cập nhật thất bại";
              }
              return "Cập nhật thất bại";
            },
          },
        },
      )
      .finally(() => setLoading(false));
  };

  if (isPageLoading) {
    return <Loading fullScreen text="Đang tải..." />;
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10">
        <BackButton className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 cursor-pointer" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full  max-w-md bg-white rounded-2xl shadow-md sm:shadow-lg p-6 sm:p-8"
      >
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-primary text-center">
          Chỉnh sửa thông tin cá nhân
        </h1>
        <div className="mb-4">
          <label className="block font-medium mb-1 text-sm sm:text-base">
            Họ tên
          </label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm sm:text-base ${
              errors.fullName ? "border-red-400" : "border-gray-200"
            } focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
            disabled={loading}
            autoComplete="off"
          />
          {errors.fullName && (
            <div className="text-red-500 text-xs sm:text-sm mt-1">
              {errors.fullName}
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1 text-sm sm:text-base">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            disabled
            className="w-full px-3 py-2 border rounded-lg bg-gray-100 border-gray-200 text-gray-500 text-sm sm:text-base cursor-not-allowed"
            autoComplete="off"
          />
        </div>
        <div className="mb-6">
          <label className="block font-medium mb-1 text-sm sm:text-base">
            Số điện thoại
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm sm:text-base ${
              errors.phone ? "border-red-400" : "border-gray-200"
            } focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
            disabled={loading}
            autoComplete="off"
            placeholder="Nhập số điện thoại (nếu có)"
          />
          {errors.phone && (
            <div className="text-red-500 text-xs sm:text-sm mt-1">
              {errors.phone}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all text-sm sm:text-base shadow-sm"
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        <ToastContainer autoClose={1500} hideProgressBar pauseOnHover={false} />
      </form>
    </div>
  );
}
