"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import CategoryTable from "@/app/components/CategoryTable/CategoryTable";
import StatusFilter from "@/app/components/StatusFilter/StatusFilter";
import Search from "@/app/components/Search/Search";
import { Category } from "@/app/interfaces/category.interface";
import debounce from "lodash.debounce";
import Pagination from "@/app/components/Pagination/Pagination";
import ChangeMulti from "@/app/components/ChangeMulti/ChangeMulti";
import useChangeStatus from "@/app/utils/useChangeStatus";
import { useBulkSelect } from "@/app/utils/useBulkSelect";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal/ConfirmDeleteModal";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import NewAddButton from "@/app/components/NewAddButton/NewAddButton";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editedCategories, setEditedCategories] = useState<Category[]>([]);
  const [sort, setSort] = useState<{ key: string; value: 1 | -1 } | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const limit = 5;

  const fetchData = useCallback(
    debounce(() => {
      setLoading(true);
      axios
        .get(`http://localhost:3001/api/v1/${ADMIN_PREFIX}/categories`, {
          params: {
            ...(status && { status }),
            ...(keyword && { keyWord: keyword }),
            ...(sort && { sortKey: sort.key, sortValue: sort.value }),
            page,
            limit,
          },
        })
        .then((res) => {
          setCategories(res.data.categories || []);
          setTotal(res.data.total || 0);
        })
        .catch(() => setCategories([]))
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
    setEditedCategories(categories);
  }, [categories]);

  const fetchAllCategories = async () => {
    const res = await axios.get(
      `http://localhost:3001/api/v1/${ADMIN_PREFIX}/categories`,
      {
        params: { page: 1, limit: 10000 },
      }
    );
    return res.data.categories || [];
  };

  const handleChangeStatus = useChangeStatus(fetchData, "categories");

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
    categories,
    fetchData,
    fetchAllCategories,
    "categories",
    setEditedCategories,
    editedCategories,
    "thể loại"
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.patch(
        `http://localhost:3001/api/v1/${ADMIN_PREFIX}/categories/delete/${deleteId}`
      );
      setDeleteId(null);
      fetchData();
      toast.success("Xóa thể loại thành công!");
    } catch (error) {
      console.log(error);
      toast.error("Xóa thể loại thất bại");
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
          📂 Quản lý thể loại
        </h1>
        <NewAddButton label="Thêm thể loại mới" source="categories" />
      </motion.div>

      <motion.div
        initial={isFirstLoad ? { opacity: 0, y: -20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center justify-between mb-6"
      >
        <StatusFilter value={status} onChange={setStatus} />
        <Search value={keyword} onChange={setKeyword} label="thể loại" />
      </motion.div>

      <motion.div
        initial={isFirstLoad ? { opacity: 0, y: -20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-between items-center"
      >
        <ChangeMulti
          options={[
            { label: "Hoạt động", value: "active" },
            { label: "Dừng hoạt động", value: "inactive" },
            { label: "Đổi vị trí", value: "position-change" },
            { label: "Xóa tất cả", value: "delete_all" },
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
            className="text-center py-8"
          >
            Đang tải...
          </motion.div>
        ) : categories.length === 0 ? (
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
            <CategoryTable
              categories={editedCategories}
              setEditedCategories={setEditedCategories}
              onChangeStatus={handleChangeStatus}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              setDeleteId={setDeleteId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && categories.length > 0 && (
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

      <ConfirmDeleteModal
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
      />
      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </>
  );
}
