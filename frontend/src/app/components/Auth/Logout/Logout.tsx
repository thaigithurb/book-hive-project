import { MdLogout } from "react-icons/md";
import { toast } from "react-toastify";
import ConfirmModal from "../../ConfirmModal/ConfirmModal";
import { useState } from "react";
import axios from "axios";

interface LogoutProps {
  url: string;
  href: string;
  className: string;
  side: string;
  icon: boolean;
}

export default function Logout({
  url,
  href,
  className,
  side,
  icon,
}: LogoutProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(url, {}, { withCredentials: true });

      if (side === "admin") {
        localStorage.removeItem("admin_user");
        localStorage.removeItem("accessToken_admin");
      } else {
        localStorage.removeItem("client_user");
        localStorage.removeItem("accessToken_user");
      }
      setShowLogoutModal(false);
      toast.success("Đăng xuất thành công!");
      setTimeout(() => {
        window.location.href = href;
      }, 1600);
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
        labelCancel="Hủy"
      />
      <button onClick={handleOpenLogoutModal} className={className}>
        {icon && <MdLogout className="mr-2" />}
        <span className="flex-1">Đăng xuất</span>
      </button>
    </>
  );
}
