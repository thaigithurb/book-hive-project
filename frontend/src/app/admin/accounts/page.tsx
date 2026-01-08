"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import StatusFilter from "@/app/components/StatusFilter/StatusFilter";
import Search from "@/app/components/Search/Search";
import debounce from "lodash.debounce";
import Pagination from "@/app/components/Pagination/Pagination";
import ChangeMulti from "@/app/components/ChangeMulti/ChangeMulti";
import useChangeStatus from "@/app/utils/useChangeStatus";
import { useBulkSelect } from "@/app/utils/useBulkSelect";
import ConfirmModal from "@/app/components/ConfirmModal/ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import AccountTable from "@/app/components/AccountTable/AccountTable";
import { Account } from "@/app/interfaces/account.interface";
import NewAddButton from "@/app/components/NewAddButton/NewAddButton";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editedAccounts, setEditedAccounts] = useState<Account[]>([]);
  const [sort, setSort] = useState<{ key: string; value: 1 | -1 } | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const limit = 5;
  const accessToken = localStorage.getItem("accessToken");

  const fetchData = useCallback(
    debounce(() => {
      setLoading(true);
      axios
        .get(`http://localhost:3001/api/v1/${ADMIN_PREFIX}/accounts`, {
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
          setAccounts(res.data.accounts || []);
          setTotal(res.data.total || 0);
        })
        .catch(() => setAccounts([]))
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

  // lấy tất cả tài khoản không phân trang
  useEffect(() => {
    setEditedAccounts(accounts);
  }, [accounts]);

  const fetchAllAccounts = async () => {
    const res = await axios.get(
      `http://localhost:3001/api/v1/${ADMIN_PREFIX}/accounts`,
      {
        params: { page: 1, limit: 10000 },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return res.data.accounts || [];
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
    accounts,
    fetchData,
    fetchAllAccounts,
    "accounts",
    setEditedAccounts,
    editedAccounts,
    "tài khoản"
  );

  // Hàm đổi trạng thái
  const handleChangeStatus = useChangeStatus(fetchData, "accounts");

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.patch(
        `http://localhost:3001/api/v1/${ADMIN_PREFIX}/accounts/delete/${deleteId}`,
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
      toast.error("Xóa vai trò thất bại");
    }
  };

  const handleSortChange = (e: any) => {
    const val = e.target.value;
    switch (val) {
      case "title_asc":
        setSort({ key: "title", value: 1 });
        break;
      case "title_desc":
        setSort({ key: "title", value: -1 });
        break;
      case "createdAt_asc":
        setSort({ key: "createdAt", value: 1 });
        break;
      case "createdAt_desc":
        setSort({ key: "createdAt", value: -1 });
        break;
      default:
        setSort(null);
    }
  };

  return (
    <>
      <motion.div
        initial={isFirstLoad ? { opacity: 0, y: -20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-[32px] font-bold m-0 text-primary">
          🔑 Quản lý tài khoản
        </h1>
        <NewAddButton label="Thêm tài khoản mới" source="accounts" />
      </motion.div>

      <motion.div
        initial={isFirstLoad ? { opacity: 0, y: -20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center justify-between mb-6"
      >
        <StatusFilter value={status} onChange={setStatus} />
        <Search value={keyword} onChange={setKeyword} label="tài khoản" />
      </motion.div>

      <motion.div
        initial={isFirstLoad ? { opacity: 0, y: -20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-between items-center"
      >
        <ChangeMulti
          options={[
            { label: "Xóa tất cả", value: "delete_all" },
            { label: "Hoạt động", value: "active" },
            { label: "Dừng hoạt động", value: "inactive" },
          ]}
          bulkValue={bulkValue}
          setBulkValue={setBulkValue}
          onBulkChange={handleBulkChange}
          disabled={!bulkValue || selectedIds.length === 0}
        />
        <div className="mb-6">
          <select
            onChange={handleSortChange}
            className="border bg-white border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-secondary1 focus:border-secondary1 transition shadow-sm hover:border-secondary1 cursor-pointer"
          >
            <option value="">Sắp xếp</option>
            <option value="title_asc">Tên A-Z</option>
            <option value="title_desc">Tên Z-A</option>
            <option value="createdAt_desc">Mới nhất</option>
            <option value="createdAt_asc">Cũ nhất</option>
          </select>
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
        ) : accounts.length === 0 ? (
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
            <AccountTable
              accounts={editedAccounts}
              onChangeStatus={handleChangeStatus}
              setEditedAccounts={setEditedAccounts}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              setDeleteId={setDeleteId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && accounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPageChange={setPage}
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
