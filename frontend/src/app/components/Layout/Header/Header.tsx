import Link from "next/link";

export const Header = () => {
  return (
    <>
      <header className="p-[16px] fixed top-0 z-999 w-full bg-[#ffff] shadow-[0_2px_8px_rgba(0,0,0,0.05)] ">
        <nav className="container flex items-center justify-between">
          <Link href={"/home"} className="flex gap-[12px] items-center">
            <span className="text-[32px]">📚</span>
            <div>
              <h1
                className="m-0 text-[24px] font-[700] text-primary"
                title="BookHive"
              >
                BookHive
              </h1>
              <p className="text-[13.6px] text-[#64748b]">
                Nơi tri thức hội tụ
              </p>
            </div>
          </Link>
          <div className="flex gap-[24px] items-center">
            <form className="flex items-center" action="/search" method="GET">
              <input
                type="text"
                name="q"
                placeholder="Tìm kiếm sách..."
                className="px-2 py-1 border rounded"
              />
              <button
                type="submit"
                className="ml-2 px-3 py-1 bg-primary text-white rounded"
              >
                Tìm
              </button>
            </form>
            <div className="dropdown">
              <Link href="/books" className="text-primary dropbtn hover:underline">
                Tất cả sách
              </Link>
              <div className="absolute left-0 mt-2 w-[140px] dropdown-content bg-white shadow-lg rounded hidden">
                <Link
                  href="/rent"
                  className="block px-4 py-2 text-primary hover:bg-gray-100"
                >
                  Sách thuê
                </Link>
                <Link
                  href="/buy"
                  className="block px-4 py-2 text-primary hover:bg-gray-100"
                >
                  Sách mua
                </Link>
              </div>
            </div>
            <Link href="/account" className="text-primary hover:underline">
              Tài khoản
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
};
