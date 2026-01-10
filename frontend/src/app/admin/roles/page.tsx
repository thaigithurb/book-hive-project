"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Search from "@/app/components/Search/Search";
import debounce from "lodash.debounce";
import Pagination from "@/app/components/Pagination/Pagination";
import ChangeMulti from "@/app/components/ChangeMulti/ChangeMulti";
import { useBulkSelect } from "@/app/utils/useBulkSelect";
import ConfirmModal from "@/app/components/ConfirmModal/ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import RoleTable from "@/app/components/RoleTable/RoleTable";
import { Role } from "@/app/interfaces/role.interface";
import NewAddButton from "@/app/components/NewAddButton/NewAddButton";
import { usePageChange } from "@/app/utils/usePageChange";
import { useSortChange } from "@/app/utils/useSortChange";
import SortSelect from "@/app/components/SortSelect/SortSelect";
import { useSyncParams } from "@/app/utils/useSyncParams";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editedRoles, setEditedRoles] = useState<Role[]>([]);
  const [sort, setSort] = useState<{ key: string; value: 1 | -1 } | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const limit = 5;
  const accessToken = localStorage.getItem("accessToken");
  const [sortValue, setSortValue] = useState("");
  const sortOptions = [
    { value: "", label: "Sắp xếp" },
    { value: "title_asc", label: "Tên A-Z" },
    { value: "title_desc", label: "Tên Z-A" },
    { value: "createdAt_desc", label: "Mới nhất" },
    { value: "createdAt_asc", label: "Cũ nhất" },
  ];

  const fetchData = useCallback(
    debounce(() => {
      setLoading(true);
      axios
        .get(`http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles`, {
          params: {
            ...(status && { status }),
            ...(keyword && { keyWord: keyword }),
            ...(sort && { sortKey: sort.key, sortValue: sort.value }),
            page,
            limit,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        })
        .then((res) => {
          setRoles(res.data.roles || []);
          setTotal(res.data.total || 0);
        })
        .catch(() => setRoles([]))
        .finally(() => {
          setLoading(false);
          setIsFirstLoad(false);
        });
    }, 400),
    [status, keyword, page, sort]
  );

  useEffect(() => {
    fetchData();
    return fetchData.cancel;
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [status, keyword]);

  useEffect(() => {
    setEditedRoles(roles);
  }, [roles]);

  const fetchAllRoles = async () => {
    const res = await axios.get(
      `http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles`,
      {
        params: { page: 1, limit: 10000 },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return res.data.roles || [];
  };

  const {
    selectedIds,
    setSelectedIds,
    bulkValue,
    setBulkValue,
    handleSelectAll,
    handleSelect,
    handleBulkChange,
    pendingDeleteIds,
    setPendingDeleteIds,
    executeBulkDelete,
  } = useBulkSelect(
    roles,
    fetchData,
    fetchAllRoles,
    "roles",
    setEditedRoles,
    editedRoles,
    "vai trò"
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.patch(
        `http://localhost:3001/api/v1/${ADMIN_PREFIX}/roles/delete/${deleteId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      setDeleteId(null);
      fetchData();
      toast.success("Xóa vai trò thành công!");
    } catch (error) {
      console.log(error);
      toast.error("Xóa vai trò thất bại");
    }
  };

  // hàm thay đổi trang
  const handlePageChange = usePageChange("roles", setPage);

  //  Xử lý thay đổi sort từ dropdown
  const handleSortChange = useSortChange("roles");

  // ĐỒNG BỘ page với URL mỗi khi searchParams thay đổi
  useSyncParams(setPage, setSortValue, setSort);

  return (
    <>
      <motion.div
        initial={isFirstLoad ? { opacity: 0, y: -20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-[32px] font-bold m-0 text-primary">
          🔑 Nhóm quyền
        </h1>
        <NewAddButton label="Thêm vai trò mới" source="roles" />
      </motion.div>

      <motion.div
        initial={isFirstLoad ? { opacity: 0, y: -20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center justify-between mb-6"
      >
        <Search value={keyword} onChange={setKeyword} label="vai trò" />
      </motion.div>

      <motion.div
        initial={isFirstLoad ? { opacity: 0, y: -20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-between items-center"
      >
        <ChangeMulti
          options={[{ label: "Xóa tất cả", value: "delete_all" }]}
          bulkValue={bulkValue}
          setBulkValue={setBulkValue}
          onBulkChange={handleBulkChange}
          disabled={!bulkValue || selectedIds.length === 0}
        />
        <div className="mb-6">
          <SortSelect
            sortValue={sortValue}
            onChange={(e) => {
              handleSortChange(e, setSort);
              setSortValue(e.target.value);
            }}
            options={sortOptions}
          />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center text-gray-500 py-8"
          >
            Đang tải...
          </motion.div>
        ) : roles.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center py-8 text-gray-500 text-lg font-semibold"
          >
            Không tìm thấy
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <RoleTable
              roles={editedRoles}
              setEditedRoles={setEditedRoles}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              setDeleteId={setDeleteId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && roles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPageChange={handlePageChange}
          />
        </motion.div>
      )}

      <ConfirmModal
        open={!!deleteId || pendingDeleteIds.length > 0}
        onCancel={() => {
          setDeleteId(null);
          setPendingDeleteIds([]);
        }}
        onConfirm={() => {
          if (deleteId) {
            handleDelete();
          } else {
            executeBulkDelete();
          }
        }}
        message={
          pendingDeleteIds.length > 0
            ? `Bạn có chắc chắn muốn xóa ${pendingDeleteIds.length} mục đã chọn?`
            : deleteId
            ? "Bạn có chắc chắn muốn xóa mục này?"
            : ""
        }
        label="Xóa"
      />
      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </>
  );
}
