import { useRouter } from "next/navigation";
import { Category } from "@/app/interfaces/category.interface";
import CategoryStatusBadge from "../ChangeStatusBadge/ChangeStatusBadge";
import React from "react";
import TableActions from "../TableActions/TableActions";
import ActivityLog from "../ActivityLog/ActivityLog";

interface CategoryTableProps {
  categories: Category[];
  onChangeStatus: (id: string, currentStatus: string) => void;
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  setDeleteId: (id: string) => void;
  setEditedCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export default function CategoryTable({
  categories,
  onChangeStatus,
  selectedIds,
  onSelect,
  onSelectAll,
  setDeleteId,
  setEditedCategories,
}: CategoryTableProps) {
  const router = useRouter();
  const allChecked =
    categories.length > 0 &&
    categories.every((b) => b._id !== undefined && selectedIds.includes(b._id));

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow">
      <table className="min-w-full">
        <thead>
          <tr className="bg-[#D4E7FC]">
            <th className="py-4 px-4 text-left text-[14.4px]">
              <input
                type="checkbox"
                checked={allChecked}
                className="cursor-pointer"
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              STT
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Thể loại
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Mô tả
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Trạng thái
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Vị trí
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Log activity
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, idx) => (
            <tr
              className="border-t"
              style={{ borderColor: "#64748b33" }}
              key={category._id}
            >
              <td className="py-4 px-4">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={
                    category._id !== undefined &&
                    selectedIds.includes(category._id)
                  }
                  onChange={(e) => {
                    if (category._id !== undefined) {
                      onSelect(category._id, e.target.checked);
                    }
                  }}
                />
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {idx + 1}
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {category.title}
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {category.description}
              </td>
              <td className="py-4 px-4">
                {category._id && (
                  <CategoryStatusBadge
                    status={category.status}
                    onClick={() => {
                      if (category._id) {
                        onChangeStatus(category._id, category.status);
                      }
                    }}
                  />
                )}
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                <input
                  type="number"
                  min={1}
                  className="w-16 px-2 py-1 border border-gray-300 outline-none focus:ring-2 focus:ring-secondary1 hover:border-secondary1 focus:border-secondary1 transition rounded text-center"
                  value={
                    typeof category.position === "number" &&
                    category.position > 0
                      ? category.position
                      : ""
                  }
                  onChange={(e) => {
                    const newPosition = Number(e.target.value);
                    setEditedCategories((prev) =>
                      prev.map((b) =>
                        b._id === category._id
                          ? { ...b, position: newPosition }
                          : b
                      )
                    );
                  }}
                />
              </td>
               <td className="py-4 px-4 text-[13px] text-gray-700">
                  <ActivityLog record={category} />
              </td>
              <td className="py-4 px-4">
                <TableActions
                  actions={[
                    {
                      label: "Sửa",
                      title: "edit",
                      class:
                        "py-1 px-3 rounded-[6px] text-[13.6px] font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors duration-200 cursor-pointer",
                    },
                  ]}
                  source="categories"
                  slug={category.slug}
                  id={category._id}
                  onDelete={setDeleteId}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
