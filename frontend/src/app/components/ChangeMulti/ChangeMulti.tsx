interface ChangeMultiProps {
  bulkValue: string;
  setBulkValue: (value: string) => void;
  onBulkChange: () => void;
  disabled: boolean;
}

export default function ChangeMulti({
  bulkValue,
  setBulkValue,
  onBulkChange,
  disabled,
}: ChangeMultiProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <select
        className="border bg-white border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 select-dropdown focus:ring-secondary1 focus:border-secondary1 transition shadow-sm hover:border-secondary1 cursor-pointer"
        value={bulkValue}
        onChange={(e) => setBulkValue(e.target.value)}
      >
        <option value="">Chọn thao tác</option>
        <option value="active">Hoạt động</option>
        <option value="inactive">Dừng hoạt động</option>
        <option value="delete">Xóa</option>
        <option value="position-change">Đổi vị trí</option>
      </select>
      <button
        className="transition-colors duration-200 px-4 py-2 bg-secondary1 text-white rounded-lg text-[15px] font-semibold disabled:opacity-50 hover:bg-blue-600 cursor-pointer"
        onClick={onBulkChange}
        disabled={disabled}
      >
        Cập nhật
      </button>
    </div>
  );
}
