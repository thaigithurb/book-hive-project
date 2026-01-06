"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  message: string;
  label: string;
}

export default function ConfirmModal({
  open,
  onCancel,
  onConfirm,
  message,
  label
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-lg min-w-[320px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 text-lg font-semibold text-center text-gray-800">
              {message}
            </div>
            <div className="flex justify-center gap-3">
              <button
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all duration-200 cursor-pointer font-medium"
                onClick={onCancel}
              >
                Hủy
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-red-500 transition-all duration-200 text-white cursor-pointer hover:bg-red-600 font-medium shadow-md hover:shadow-lg"
                onClick={onConfirm}
              >
                {label}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}