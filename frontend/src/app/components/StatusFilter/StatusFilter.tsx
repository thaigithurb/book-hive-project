interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StatusFilter({
  value,
  onChange,
}: StatusFilterProps) {
  return (
    <>
      <div className="flex items-center gap-3">
        <label className="font-medium text-primary text-[15px]">
          Trạng thái:
        </label>
        <select
          className="border bg-white border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-secondary1 focus:border-secondary1 transition shadow-sm hover:border-secondary1 cursor-pointer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Dừng hoạt động</option>
        </select>
      </div>
    </>
  );
}
