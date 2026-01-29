import {
  FaFacebookF,
  FaInstagram,
  FaGithub,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-900 text-white pt-10 pb-5 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo & Slogan */}
        <div>
          <span className="font-extrabold text-2xl tracking-wide text-yellow-400">
            BookHive
          </span>
          <p className="mt-2 text-sm opacity-80">
            Nền tảng mua & thuê sách trực tuyến uy tín, đa dạng đầu sách, giao
            hàng tận nơi.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-yellow-300">Liên kết nhanh</h4>
          <ul className="space-y-1 text-sm opacity-90">
            <li>
              <a href="/home" className="hover:text-yellow-400">
                Trang chủ
              </a>
            </li>
            <li>
              <a href="/books" className="hover:text-yellow-400">
                Sách
              </a>
            </li>
            <li>
              <a href="/cart" className="hover:text-yellow-400">
                Giỏ hàng
              </a>
            </li>
            <li>
              <a href="/history" className="hover:text-yellow-400">
                Tra cứu
              </a>
            </li>
            <li>
              <a href="/profile" className="hover:text-yellow-400">
                Tài khoản
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-yellow-300">Liên hệ</h4>
          <ul className="space-y-1 text-sm opacity-90">
            <li className="flex items-center gap-2">
              <FaPhoneAlt /> <span>0935 846 541</span>
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope /> <span>bookhivestore161@gmail.com</span>
            </li>
            <li>286 Nguyễn Văn Lượng, Phường 16, Gò Vấp, TPHCM</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-yellow-300">
            Kết nối với chúng tôi
          </h4>
          <div className="flex gap-4 mt-1">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener"
              className="hover:text-yellow-400"
            >
              <FaFacebookF size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener"
              className="hover:text-yellow-400"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://github.com/thaigithurb"
              target="_blank"
              rel="noopener"
              className="hover:text-yellow-400"
            >
              <FaGithub size={20} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-700 mt-8 pt-4 text-center text-xs opacity-70">
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
