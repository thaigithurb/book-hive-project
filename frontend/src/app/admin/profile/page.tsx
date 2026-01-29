"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Image from "next/image";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken_admin");
        const res = await axios.get(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/accounts/profile`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        setUser(res.data.account);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading)
    return <div className="text-center text-gray-500 mt-50">Đang tải...</div>;
  if (!user)
    return (
      <div className="text-center mt-50 text-red-500">
        Không tìm thấy thông tin cá nhân.
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-xl mx-auto mt-30 bg-white rounded-xl shadow-md p-8"
    >
      <div className="flex items-center space-x-6 mb-6">
        <Image
          src={user.avatar}
          alt="Avatar"
          width={400}
          height={400}
          className="w-24 h-24 rounded-full border-2 border-primary object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">
            {user.fullName}
          </h2>
          <span className="text-sm text-gray-500">{user.role_id.title}</span>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-600 font-medium">Email</label>
          <div className="text-lg">{user.email}</div>
        </div>
        <div>
          <label className="block text-gray-600 font-medium">
            Số điện thoại
          </label>
          <div className="text-lg">{user.phone}</div>
        </div>
      </div>
    </motion.div>
  );
}
