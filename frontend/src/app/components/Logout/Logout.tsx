import { MdLogout } from "react-icons/md";
import { toast } from "react-toastify";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import { useState } from "react";
import axios from "axios";

interface LogoutProps {
  url: string;
  href: string;
}

export default function Logout({ url, href }: LogoutProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(url, {}, { withCredentials: true });
      localStorage.removeItem("accessToken");
      setShowLogoutModal(false);
      toast.success("Đăng xuất thành công!");
      setTimeout(() => {
        window.location.href = href;
      }, 1000);
    } catch (error: any) {
      toast.error("Đăng xuất thất bại!");
      setShowLogoutModal(false);
      return;
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleOpenLogoutModal = () => {
    setShowLogoutModal(true);
  };

  return (
    <>
      <ConfirmModal
        open={showLogoutModal}
        onCancel={handleCancelLogout}
        onConfirm={handleLogout}
        message="Bạn có chắc chắn muốn đăng xuất?"
        label="Có"
      />
      <div className="flex justify-center mb-[50px]">
        <button
          onClick={handleOpenLogoutModal}
          className="flex w-[80%] items-center py-3 px-6 bg-[#F37B74] transition-colors duration-200 text-white rounded-[12px] text-[16px] font-semibold cursor-pointer hover:bg-[#F2656E]"
        >
          <MdLogout className="" />
          <span className="flex-1">Đăng xuất</span>
        </button>
      </div>
    </>
  );
}
