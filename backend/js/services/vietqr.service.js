"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentTransactions = exports.checkBankTransaction = void 0;
const axios = require("axios");
const VIETQR_API = "https://api.vietqr.io/v2";
const VIETQR_CLIENT_ID = process.env.VIETQR_CLIENT_ID;
const VIETQR_API_KEY = process.env.VIETQR_API_KEY;
const checkBankTransaction = (bankCode, accountNo, amount, description) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!VIETQR_CLIENT_ID || !VIETQR_API_KEY) {
            console.warn("⚠️ VIETQR_CLIENT_ID hoặc VIETQR_API_KEY chưa được set");
            return null;
        }
        console.log("🔍 Kiểm tra giao dịch VietQR:", {
            bankCode,
            accountNo,
            amount,
            description,
        });
        const response = yield axios.get(`${VIETQR_API}/transactions`, {
            headers: {
                "x-client-id": VIETQR_CLIENT_ID,
                "x-api-key": VIETQR_API_KEY,
                "Content-Type": "application/json",
            },
            params: {
                bank_code: bankCode,
                account_no: accountNo,
                amount: amount,
                query: description,
            },
            timeout: 10000,
        });
        console.log("📊 Response từ VietQR:", response.data);
        if (response.data.success &&
            response.data.data &&
            response.data.data.length > 0) {
            const transaction = response.data.data[0];
            return {
                id: transaction.id || transaction.reference,
                amount: transaction.amount,
                description: transaction.description,
                transactionDate: transaction.when || new Date().toISOString(),
                referenceCode: transaction.reference || "",
            };
        }
        console.warn("⚠️ Không tìm thấy giao dịch phù hợp");
        return null;
    }
    catch (error) {
        console.error("❌ Lỗi kiểm tra giao dịch VietQR:", {
            message: error.message,
            status: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status,
            data: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data,
        });
        return null;
    }
});
exports.checkBankTransaction = checkBankTransaction;
const getRecentTransactions = (bankCode_1, accountNo_1, ...args_1) => __awaiter(void 0, [bankCode_1, accountNo_1, ...args_1], void 0, function* (bankCode, accountNo, limit = 10) {
    try {
        if (!VIETQR_CLIENT_ID || !VIETQR_API_KEY) {
            console.warn("⚠️ VIETQR_CLIENT_ID hoặc VIETQR_API_KEY chưa được set");
            return [];
        }
        const response = yield axios.get(`${VIETQR_API}/transactions`, {
            headers: {
                "x-client-id": VIETQR_CLIENT_ID,
                "x-api-key": VIETQR_API_KEY,
                "Content-Type": "application/json",
            },
            params: {
                bank_code: bankCode,
                account_no: accountNo,
            },
            timeout: 10000,
        });
        if (response.data.success && response.data.data) {
            return response.data.data.slice(0, limit).map((tx) => ({
                id: tx.id || tx.reference,
                amount: tx.amount,
                description: tx.description,
                transactionDate: tx.when || new Date().toISOString(),
                referenceCode: tx.reference || "",
            }));
        }
        return [];
    }
    catch (error) {
        console.error("❌ Lỗi lấy giao dịch từ VietQR:", error.message);
        return [];
    }
});
exports.getRecentTransactions = getRecentTransactions;
module.exports = { checkBankTransaction: exports.checkBankTransaction, getRecentTransactions: exports.getRecentTransactions };
