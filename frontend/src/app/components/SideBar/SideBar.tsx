"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToastContainer } from "react-toastify";
import Logout from "../Auth/Logout/Logout";
import { useUser } from "@/contexts/UserContext";

const menu = [
  { label: "📊 Dashboard", key: "dashboard", href: "/admin/dashboard" },
  {
    label: "📚 Quản lý sách",
    key: "books",
    href: "/admin/books",
    permission: "view_books",
  },
  {
    label: "🏷️ Quản lý thể loại",
    key: "categories",
    href: "/admin/categories",
    permission: "view_categories",
  },
  {
    label: "🔑 Nhóm quyền",
    key: "roles",
    href: "/admin/roles",
    permission: "view_roles",
  },
  {
    label: "🛡️ Phân quyền",
    key: "permissions",
    href: "/admin/roles/permissions",
    permission: "view_permissions",
  },
  {
    label: "🧑‍💼 Quản lý tài khoản",
    key: "accounts",
    href: "/admin/accounts",
    permission: "edit_user",
  },
  { label: "👤 Thông tin cá nhân", key: "profile", href: "/admin/profile" }, 
];

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export const SideBar = () => {
  const { user } = useUser();
  const permissions = user?.permissions || [];
  const pathname = usePathname();
  const active =
    menu
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => pathname?.startsWith(item.href))?.key || "";

  return (
    <>
      <aside className="fixed top-0 left-0 h-screen w-[280px] bg-white p-6 shadow-[2px_0_8px_rgba(0,0,0,0.05)] z-30 flex flex-col">
        <div className="mb-8">
          <h2 className="text-[24px] font-bold mb-2 text-primary">
            Admin Panel
          </h2>
        </div>
        <nav className="flex-1">
          {menu
            .filter(
              (item) =>
                !item.permission || permissions.includes(item.permission)
            )
            .map((item) => (
              <Link
                href={item.href}
                key={item.key}
                className="block w-full mb-2"
              >
                <button
                  type="button"
                  className={`w-full py-3 px-4 rounded-[8px] cursor-pointer text-left text-[16px] font-medium transition-colors duration-300
          ${
            active === item.key
              ? "bg-secondary1 text-white"
              : "bg-transparent text-primary hover:bg-[#D4E7FC] hover:text-primary"
          }
        `}
                >
                  {item.label}
                </button>
              </Link>
            ))}
        </nav>
        <Logout
          url={`http://localhost:3001/api/v1/${ADMIN_PREFIX}/auth/logout`}
          href={"/auth/login"}
        />
      </aside>
      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </>
  );
};
