"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { label: "📊 Dashboard", key: "dashboard", href: "/admin/dashboard" },
  { label: "📚 Quản lý sách", key: "books", href: "/admin/books" },
  { label: "👥 Quản lý người dùng", key: "users", href: "/admin/users" },
  {
    label: "💰 Quản lý giao dịch",
    key: "transactions",
    href: "/admin/transactions",
  },
  {
    label: "🏷️ Quản lý thể loại",
    key: "categories",
    href: "/admin/categories",
  },
  { label: "🔑 Nhóm quyền", key: "roles", href: "/admin/roles" },
  {
    label: "🛡️ Phân quyền",
    key: "permissions",
    href: "/admin/roles/permissions",
  },
];

export const SideBar = () => {
  const pathname = usePathname();
  const active =
    menu
      .slice() 
      .sort((a, b) => b.href.length - a.href.length) 
      .find((item) => pathname?.startsWith(item.href))?.key || "";

  return (
    <aside className="fixed top-0 left-0 h-screen w-[280px] bg-white p-6 shadow-[2px_0_8px_rgba(0,0,0,0.05)] z-30 flex flex-col">
      <div className="mb-8">
        <h2 className="text-[24px] font-bold mb-2 text-primary">Admin Panel</h2>
      </div>
      <nav className="flex-1">
        {menu.map((item) => (
          <Link href={item.href} key={item.key} className="block w-full mb-2">
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
    </aside>
  );
};
