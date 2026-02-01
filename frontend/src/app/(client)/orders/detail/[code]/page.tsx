"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Order = {
  _id: string;
  orderCode: string;
  userInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    bookId: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  isExpired: boolean;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
};

export default function OrderDetailPage() {
  const { code } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/v1/orders/detail/${code}`);
        setOrder(res.data.order);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Không tìm thấy đơn hàng!",
        );
        router.replace("/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [code, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow p-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-8 bg-gray-200 rounded w-full mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-24 bg-gray-200 rounded" />
                <div className="flex-1 space-y-2 py-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <div className="text-lg font-bold mb-2">Không tìm thấy đơn hàng</div>
          <Link
            href="/orders"
            className="inline-block mt-4 px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-blue-700 transition"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow p-6 md:p-10">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Chi tiết đơn hàng
            </h1>
            <span className="text-sm text-gray-500">
              Mã đơn: <span className="font-semibold">{order.orderCode}</span>
            </span>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Thông tin người nhận</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <div>Họ tên: {order.userInfo.fullName}</div>
              <div>Email: {order.userInfo.email}</div>
              <div>Điện thoại: {order.userInfo.phone}</div>
              <div>Địa chỉ: {order.userInfo.address}</div>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Sản phẩm</h2>
            <div className="divide-y">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 py-4">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={400}
                    height={400}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </div>
                    <div className="text-sm text-gray-500">
                      Đơn giá: {item.price.toLocaleString()}₫
                    </div>
                  </div>
                  <div className="font-bold text-primary text-right min-w-[80px]">
                    {(item.price * item.quantity).toLocaleString()}₫
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">
                Phương thức thanh toán
              </div>
              <div className="font-semibold">{order.paymentMethod == "transfer" ? "Chuyển khoản" : "COD"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Trạng thái</div>
              <div className="font-semibold capitalize">
                {order.status === "pending"
                  ? "Chờ xác nhận"
                  : order.status === "processing"
                    ? "Đang xử lý"
                    : order.status === "shipped"
                      ? "Đã gửi"
                      : order.status === "delivered"
                        ? "Đã giao"
                        : order.status === "cancelled"
                          ? "Đã hủy"
                          : order.status}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center border-t pt-6">
            <div className="text-lg font-bold">Tổng cộng</div>
            <div className="text-2xl font-bold text-primary">
              {order.totalAmount.toLocaleString()}₫
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <Link
              href="/orders"
              className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-blue-700 transition"
            >
              ← Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
