"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import { BackButton } from "@/app/components/BackButton/BackButton";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function AccountDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const accessToken = localStorage.getItem("accessToken");

  const [account, setAccount] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/v1/${ADMIN_PREFIX}/accounts/detail/${slug}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );
        setAccount(res.data.account);

        if (res.data.account.role_id) {
          try {
            const roleRes = await axios.get(
              `http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles/${res.data.account.role_id}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
                withCredentials: true,
              }
            );
            setRole(roleRes.data.role);
          } catch {
            setRole(null);
          }
        }
      } catch (err) {
        toast.error("Không tìm thấy tài khoản!");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!account) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-xl mx-auto mt-8 bg-white p-8 rounded-xl shadow relative"
    >
      <BackButton className="absolute -top-10 -left-80 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />
      <h1 className="text-2xl font-bold mb-6 text-primary">
        Chi tiết tài khoản
      </h1>
      <div className="flex flex-col items-center gap-4">
        {account.avatar && (
          <motion.img
            src={account.avatar}
            alt="Avatar"
            className="w-45 h-45 rounded-full object-cover mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
        <div className="w-full">
          <span className="text-slate-800 font-semibold">Họ tên: </span>
          <span className="text-slate-500">{account.fullName}</span>
        </div>
        <div className="w-full">
          <span className="text-slate-800 font-semibold">Email: </span>
          <span className="text-slate-500">{account.email}</span>
        </div>
        <div className="w-full">
          <span className="text-slate-800 font-semibold">Số điện thoại: </span>
          <span className="text-slate-500">{account.phone}</span>
        </div>
        <div className="w-full">
          <span className="text-slate-800 font-semibold">Trạng thái: </span>
          <span className="text-slate-500">
            {account.status === "active" ? "Hoạt động" : "Dừng hoạt động"}
          </span>
        </div>
        <div className="w-full">
          <span className="text-slate-800 font-semibold">Vai trò: </span>
          <span className="text-slate-500">
            {role ? role.title : account.role_id}
          </span>
        </div>
      </div>
      <div className="flex gap-4 mt-8">
        <button
          className="flex-1 py-4 font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors duration-200 cursor-pointer rounded-xl"
          onClick={() =>
            router.push(`/${ADMIN_PREFIX}/accounts/edit/${account.slug}`)
          }
        >
          Chỉnh sửa
        </button>
      </div>
      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </motion.div>
  );
}
