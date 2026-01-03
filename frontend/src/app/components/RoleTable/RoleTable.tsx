import { Role } from "@/app/interfaces/role.interface";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import TableActions from "../TableActions/TableActions";

interface RoleTableProps {
  roles: Role[];
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  setDeleteId: (id: string) => void;
  setEditedRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

export default function RoleTable({
  roles,
  selectedIds,
  onSelect,
  onSelectAll,
  setDeleteId,
}: RoleTableProps) {
  const router = useRouter();
  const allChecked =
    roles.length > 0 &&
    roles.every((b) => b._id !== undefined && selectedIds.includes(b._id));

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
              Tên vai trò
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Mô tả ngắn
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {(roles || []).map((role: any, index: any) => (
            <tr
              className="border-t"
              style={{ borderColor: "#64748b33" }}
              key={index}
            >
              <td className="py-4 px-4">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={
                    role._id !== undefined && selectedIds.includes(role._id)
                  }
                  onChange={(e) => {
                    if (role._id !== undefined) {
                      onSelect(role._id, e.target.checked);
                    }
                  }}
                />
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {index + 1}
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {role.title}
              </td>
              <td
                className="py-4 px-4 text-[14.4px] text-primary"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(role.description),
                }}
              ></td>
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
                  source="roles"
                  slug={role.slug}
                  id={role._id}
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
