var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Rental = require("../../models/rental.model");
const generateHelper = require("../../../../helpers/generate");
module.exports.createRental = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { userInfo, items, totalAmount, paymentMethod } = req.body;
        if (!userInfo || !items || items.length === 0 || !totalAmount) {
            return res.status(400).json({
                message: "Thông tin đơn thuê không đầy đủ!",
            });
        }
        const rentalCode = generateHelper.generateOrderCode();
        const dueAt = new Date();
        items.forEach((item) => {
            if (item.rentalType === "day") {
                dueAt.setDate(dueAt.getDate() + item.rentalDays);
            }
            else if (item.rentalType === "week") {
                dueAt.setDate(dueAt.getDate() + item.rentalDays * 7);
            }
        });
        const rental = new Rental({
            rentalCode,
            userInfo,
            items,
            totalAmount,
            paymentMethod,
            dueAt,
        });
        yield rental.save();
        return res.status(201).json({
            message: "Tạo đơn thuê thành công!",
            rental,
            rentalCode,
        });
    }
    catch (error) {
        console.error("❌ Lỗi tạo đơn thuê:", error);
        return res.status(500).json({
            message: "Lỗi tạo đơn thuê!",
            error: error.message,
        });
    }
});
module.exports.detail = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { code } = req.params;
        const rental = yield Rental.findOne({ rentalCode: String(code) });
        if (!rental) {
            return res.status(404).json({
                message: "Không tìm thấy đơn thuê!",
            });
        }
        return res.status(200).json({
            message: "Lấy thông tin đơn thuê thành công!",
            order: rental,
        });
    }
    catch (error) {
        console.error("❌ Detail error:", error);
        return res.status(500).json({
            message: "Lỗi lấy thông tin đơn thuê!",
            error: error.message,
        });
    }
});
