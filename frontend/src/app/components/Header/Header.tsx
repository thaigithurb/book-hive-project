import Link from "next/link";

export const Header = () => {
  return (
    <>
      <header className="p-[16px] fixed top-0 z-999 w-full bg-[#ffff] shadow-[0_2px_8px_rgba(0,0,0,0.05)] ">
        <nav className="container ">
          <Link href={"/home"} className="flex gap-[12px] items-center">
            <span className="text-[32px]">
              📚
            </span>
            <div>
              <h1
                className="m-0 text-[24px] font-[700] text-[#1e293b]"
                title="BookHive"
              >
                BookHive
              </h1>
              <p className="text-[13.6px] text-[#64748b]">
                Nơi tri thức hội tụ
              </p>
            </div>
          </Link>
        </nav>
      </header>
    </>
  );
};
