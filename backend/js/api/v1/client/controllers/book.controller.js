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
const Book = require("../../models/book.model");
const Category = require("../../models/category.model");
module.exports.index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const keyword = req.query.keyWord;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const find = {
            deleted: false,
        };
        if (keyword) {
            const regex = new RegExp(keyword, "i");
            find.$or = [{ title: regex }, { author: regex }];
        }
        let sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = Number(req.query.sortValue);
        }
        else {
            sort.position = "desc";
        }
        const books = yield Book.find(find)
            .skip(skip)
            .limit(limit)
            .sort(sort);
        const total = yield Book.countDocuments(find);
        if (books && books.length > 0) {
            const booksWithCategory = [];
            for (const book of books) {
                const bookObj = book.toObject();
                if (book.category_id) {
                    const category = yield Category.findOne({
                        _id: book.category_id,
                    }).select("title");
                    bookObj.category_name = category.title;
                }
                booksWithCategory.push(bookObj);
            }
            return res.status(200).json({
                message: "Thành công!",
                books: booksWithCategory,
                total: total,
                limit: limit,
            });
        }
        return res.status(400).json({
            message: "Không có sách nào",
        });
    }
    catch (error) {
        res.json("Không tìm thấy!");
    }
});
module.exports.detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.bookSlug;
        const book = yield Book.findOne({
            slug: slug,
            deleted: false,
            status: "active",
        });
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy sách!" });
        }
        const bookObj = book.toObject();
        if (book.category_id) {
            const category = yield Category.findOne({
                _id: book.category_id,
            }).select("title");
            bookObj.category_name = category.title;
        }
        ;
        return res.status(200).json({
            message: "Lấy thông tin sách thành công!",
            book: bookObj,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Lỗi khi lấy thông tin sách!",
        });
    }
});
module.exports.featured = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const books = yield Book.find({
            deleted: false,
            status: "active",
            featured: true
        }).sort({ position: -1 });
        if (books) {
            return res.status(200).json({
                message: "Thành công!",
                books: books,
            });
        }
        return res.status(400).json({
            message: "Không có sách nào",
        });
    }
    catch (error) {
        res.json("Không tìm thấy!");
    }
});
