import { useRouter } from "next/navigation";


interface Role {
  title: string;
  description: string;
}

interface RoleTableProps {
  roles: Role[];
}

export default function RoleTable({ roles }: RoleTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow">
      <table className="min-w-full">
        <thead>
          <tr className="bg-[#D4E7FC]">
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
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {index + 1}
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {role.title}
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {role.description}
              </td>
              <td className="py-4 px-4">
                <div className="flex gap-2">
                  <button
                    className="py-1 px-3 rounded-md text-[13.6px] font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                    //   router.push(`/admin/categories/edit/${category.slug}`);
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    className="py-1 px-3 rounded-md text-[13.6px] font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                    //   if (category._id) setDeleteId(category._id);
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
