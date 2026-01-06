"use client";

import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const inputClass =
    "border bg-[#ffff] border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-secondary1 hover:border-secondary1 focus:border-secondary1 transition duration-200 w-full";



  const handleSubmit = (e: any) => {
    e.preventDefault();
    setLoading(true);

    toast
      .promise(
        axios.post(
          `http://localhost:3001/api/v1/${ADMIN_PREFIX}/auth/login`,
          {
            email,
            password,
          },
          { withCredentials: true }
        ),
        {
          pending: "Đang đăng nhập...",
          success: {
            render({ data }) {
              localStorage.setItem("accessToken", data?.data?.accessToken);
              setEmail("");
              setPassword("");
              router.push("/admin/dashboard");
              return data?.data?.message;
            },
          },
          error: {
            render({ data }) {
              if (axios.isAxiosError(data)) {
                return data.response?.data?.message;
              }
              return "Đăng nhập thất bại";
            },
          },
        }
      )
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div className="flex mt-[150px] justify-center">
        <form
          className="bg-white px-10 py-12 rounded-lg shadow-lg w-full max-w-md flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <div className="flex gap-[12px] items-center">
            <span className="text-[32px]">📚</span>
            <div>
              <h1
                className="m-0 text-[24px] font-[700] text-[#1e293b]"
                title="BookHive"
              >
                BookHive
              </h1>
              <p className="text-[13.6px] text-[#64748b]">Admin System</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="mb-1 font-medium text-primary">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Nhập email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="mb-1 font-medium text-primary">Mật khẩu</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                className={inputClass + " pr-16"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((show) => !show)}
                className="absolute right-3 top-1/2 cursor-pointer -translate-y-1/2 text-sm text-blue-600 font-semibold focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full transition-colors duration-200 bg-secondary1 cursor-pointer hover:bg-blue-600 text-white py-2 rounded font-semibold mt-4"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </>
  );
}
