interface ChangeStatusBadge {
  status: string;
  onClick?: () => void;
}

export default function ChangeStatusBadge({ status, onClick }: ChangeStatusBadge) {
  return (
    <span
      className={`py-1 px-3 rounded-[6px] text-[13.6px] font-semibold transition-colors duration-200  cursor-pointer ${
        status === "active"
          ? "bg-[#22c55e33] text-[#22c55e] hover:bg-[#22c55e55]"
          : "bg-[#ef444433] text-[#ef4444] hover:bg-[#ef444455]"
      }`}
      onClick={onClick}
      title="Click để đổi trạng thái"
    >
      {status === "active" ? "Hoạt động" : "Dừng hoạt động"}
    </span>
  );
}