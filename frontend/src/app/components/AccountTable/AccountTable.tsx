import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { Account } from "@/app/interfaces/account.interface";
import ChangeStatusBadge from "../ChangeStatusBadge/ChangeStatusBadge";
import TableActions from "../TableActions/TableActions";

interface AccountTableProps {
  accounts: Account[];
  onChangeStatus: (id: string, currentStatus: string) => void;
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  setDeleteId: (id: string) => void;
  setEditedAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}

export default function AccountTable({
  accounts,
  onChangeStatus,
  selectedIds,
  onSelect,
  onSelectAll,
  setDeleteId,
}: AccountTableProps) {
  const router = useRouter();
  const allChecked =
    accounts.length > 0 &&
    accounts.every((b) => b._id !== undefined && selectedIds.includes(b._id));

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
              Họ tên
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Email
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Số điện thoại
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Trạng thái
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Ngày tạo
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {(accounts || []).map((account, index) => (
            <tr
              className="border-t"
              style={{ borderColor: "#64748b33" }}
              key={account._id || index}
            >
              <td className="py-4 px-4">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={
                    account._id !== undefined &&
                    selectedIds.includes(account._id)
                  }
                  onChange={(e) => {
                    if (account._id !== undefined) {
                      onSelect(account._id, e.target.checked);
                    }
                  }}
                />
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {index + 1}
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {account.fullName}
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {account.email}
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {account.phone}
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {account._id && (
                  <ChangeStatusBadge
                    status={account.status}
                    onClick={() => {
                      if (account._id)
                        onChangeStatus(account._id, account.status);
                    }}
                  />
                )}
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {account.createdAt
                  ? new Date(account.createdAt).toLocaleDateString()
                  : ""}
              </td>
              <td className="py-4 px-4">
                <TableActions
                  actions={[
                    {
                      label: "Chi tiết",
                      title: "detail",
                      class:
                        "py-1 px-3 rounded-[6px] text-[13.6px] font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-200 cursor-pointer",
                    },
                    {
                      label: "Sửa",
                      title: "edit",
                      class:
                        "py-1 px-3 rounded-[6px] text-[13.6px] font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors duration-200 cursor-pointer",
                    },
                  ]}
                  source="accounts"
                  slug={account.slug}
                  id={account._id}
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
