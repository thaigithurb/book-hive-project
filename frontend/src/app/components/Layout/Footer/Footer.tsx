import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaGithub,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-900 text-white pt-8 pb-4 md:pt-10 md:pb-5 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 text-center md:text-left">
        <div>
          <span className="font-extrabold text-xl md:text-2xl tracking-wide text-yellow-400">
            BookHive
          </span>
          <p className="mt-2 text-xs md:text-sm opacity-80">
            Nền tảng mua & thuê sách trực tuyến uy tín, đa dạng đầu sách, giao
            hàng tận nơi.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-sm md:text-base text-yellow-300">
            Liên kết nhanh
          </h4>
          <ul className="space-y-1 text-xs md:text-sm opacity-90">
            <li>
              <Link href="/home" className="hover:text-yellow-400">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/books" className="hover:text-yellow-400">
                Sách
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-yellow-400">
                Giỏ hàng
              </Link>
            </li>
            <li>
              <Link href="/look-up" className="hover:text-yellow-400">
                Tra cứu
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-yellow-400">
                Tài khoản
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-sm md:text-base text-yellow-300">
            Liên hệ
          </h4>
          <ul className="space-y-1 text-xs md:text-sm opacity-90">
            <li className="flex items-center justify-center md:justify-start gap-2">
              <FaPhoneAlt className="text-xs md:text-sm" />{" "}
              <span>0935 846 541</span>
            </li>
            <li className="flex items-center justify-center md:justify-start gap-2">
              <FaEnvelope className="text-xs md:text-sm" />{" "}
              <span>bookhivestore161@gmail.com</span>
            </li>
            <li>286 Nguyễn Văn Lượng, Phường 16, Gò Vấp, TPHCM</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-sm md:text-base text-yellow-300">
            Kết nối với chúng tôi
          </h4>
          <div className="flex justify-center md:justify-start gap-4 mt-1">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener"
              className="hover:text-yellow-400"
            >
              <FaFacebookF className="text-lg md:text-xl" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener"
              className="hover:text-yellow-400"
            >
              <FaInstagram className="text-lg md:text-xl" />
            </a>
            <a
              href="https://github.com/thaigithurb"
              target="_blank"
              rel="noopener"
              className="hover:text-yellow-400"
            >
              <FaGithub className="text-lg md:text-xl" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-700 mt-6 md:mt-8 pt-4 text-center text-[10px] md:text-xs opacity-70">
        © {new Date().getFullYear()} BookHive. Đã đăng ký bản quyền. Thiết kế &
        phát triển bởi{" "}
        <a
          href="https://github.com/thaigithurb"
          target="_blank"
          className="text-yellow-400 hover:underline"
        >
          @thaigithurb
        </a>
      </div>
    </footer>
  );
}
