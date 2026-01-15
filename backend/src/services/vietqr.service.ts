const axios = require("axios");

const VIETQR_API = "https://api.vietqr.io/v2";
const VIETQR_CLIENT_ID = process.env.VIETQR_CLIENT_ID;
const VIETQR_API_KEY = process.env.VIETQR_API_KEY;

interface BankTransaction {
  id: string;
  amount: number;
  description: string;
  transactionDate: string;
  referenceCode: string;
}

// Kiểm tra giao dịch từ VietQR
export const checkBankTransaction = async (
  bankCode: string,
  accountNo: string,
  amount: number,
  description: string
): Promise<BankTransaction | null> => {
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

    const response = await axios.get(`${VIETQR_API}/transactions`, {
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

    if (
      response.data.success &&
      response.data.data &&
      response.data.data.length > 0
    ) {
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
  } catch (error: any) {
    console.error("❌ Lỗi kiểm tra giao dịch VietQR:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return null;
  }
};

// Lấy danh sách giao dịch gần đây
export const getRecentTransactions = async (
  bankCode: string,
  accountNo: string,
  limit: number = 10
): Promise<BankTransaction[]> => {
  try {
    if (!VIETQR_CLIENT_ID || !VIETQR_API_KEY) {
      console.warn("⚠️ VIETQR_CLIENT_ID hoặc VIETQR_API_KEY chưa được set");
      return [];
    }

    const response = await axios.get(`${VIETQR_API}/transactions`, {
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
      return response.data.data.slice(0, limit).map((tx: any) => ({
        id: tx.id || tx.reference,
        amount: tx.amount,
        description: tx.description,
        transactionDate: tx.when || new Date().toISOString(),
        referenceCode: tx.reference || "",
      }));
    }

    return [];
  } catch (error: any) {
    console.error("❌ Lỗi lấy giao dịch từ VietQR:", error.message);
    return [];
  }
};

module.exports = { checkBankTransaction, getRecentTransactions };

export {};
