export default function Footer() {
  return (
    <footer className="w-full bg-black py-4 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-2">
        <span className="text-white font-bold text-lg tracking-wide">
          Personal Project
        </span>
        <span className="text-white text-[15px] opacity-80">
          <a target="_blank" href="https://github.com/thaigithurb">@thaigithurb</a>{" "}
          &nbsp;|&nbsp; No copyright. Use freely!
        </span>
      </div>
    </footer>
  );
}
