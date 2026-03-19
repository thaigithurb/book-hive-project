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
const axios_1 = require("axios");
const Category = require("../../models/category.model");
function stripCodeFences(raw) {
    if (!raw)
        return raw;
    let s = raw.trim();
    s = s
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```$/i, "")
        .trim();
    s = s.replace(/`+$/g, "").trim();
    return s;
}
function extractFirstJsonObject(raw) {
    const s = stripCodeFences(raw);
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start)
        return null;
    return s.slice(start, end + 1);
}
function safeJsonParse(input) {
    const direct = stripCodeFences(input);
    const candidate = direct.startsWith("{")
        ? direct
        : extractFirstJsonObject(direct);
    if (!candidate)
        return null;
    try {
        return JSON.parse(candidate);
    }
    catch (_a) {
        return null;
    }
}
function detectIntent(questionRaw) {
    const q = (questionRaw || "").toLowerCase();
    if (/(đăng\s*nhập|login|log\s*in)/i.test(q))
        return "auth_login";
    if (/(đăng\s*ký|register|sign\s*up)/i.test(q))
        return "auth_register";
    if (/(giỏ\s*hàng|cart|thêm\s*vào\s*giỏ|xóa\s*khỏi\s*giỏ)/i.test(q))
        return "cart";
    if (/(đơn\s*hàng|order|trạng\s*thái\s*đơn|hủy\s*đơn)/i.test(q))
        return "order";
    if (/(thanh\s*toán|payment|vnpay|momo|cod|chuyển\s*khoản)/i.test(q))
        return "payment";
    if (/(gợi\s*ý|recommend|đề\s*xuất)/i.test(q))
        return "books_recommend";
    if (/(tìm|search|kiếm|sách|book)/i.test(q))
        return "books_search";
    return "general_help";
}
function buildDefaultActions(intent, hasBooks = false) {
    switch (intent) {
        case "books_search":
        case "books_recommend":
        case "book_detail":
            if (!hasBooks) {
                return [
                    { type: "link", label: "Xem thêm", href: "/books" },
                ];
            }
            return [{ type: "link", label: "Xem danh sách sách", href: "/books" }];
        case "cart":
            return [
                { type: "link", label: "Mở giỏ hàng", href: "/cart" },
                { type: "link", label: "Tiếp tục mua sắm", href: "/books" },
            ];
        case "order":
            return [{ type: "link", label: "Xem đơn hàng của tôi", href: "/orders" }];
        case "payment":
            return [
                { type: "link", label: "Đi tới thanh toán", href: "/cart/checkout" },
                { type: "link", label: "Xem đơn hàng", href: "/orders" },
            ];
        case "auth_login":
            return [
                { type: "link", label: "Đăng nhập", href: "/auth/login" },
                { type: "link", label: "Đăng ký", href: "/auth/register" },
            ];
        case "auth_register":
            return [
                { type: "link", label: "Đăng ký", href: "/auth/register" },
                { type: "link", label: "Đăng nhập", href: "/auth/login" },
            ];
        default:
            return [{ type: "link", label: "Xem sách", href: "/books" }];
    }
}
function buildBookCards(books) {
    if (!Array.isArray(books) || books.length === 0)
        return [];
    return books.filter(Boolean).map((book) => {
        var _a, _b;
        return ({
            type: "book",
            id: String((_b = (_a = book._id) !== null && _a !== void 0 ? _a : book.id) !== null && _b !== void 0 ? _b : ""),
            title: book.title,
            author: book.author,
            image: book.image,
            price: book.priceBuy,
            rating: book.rating,
            slug: book.slug,
            href: book.slug ? `/books/detail/${book.slug}` : undefined,
        });
    });
}
function filterToRelatedBookCards(cards, relatedBooks) {
    if (!Array.isArray(cards) || cards.length === 0)
        return [];
    const allowedIds = new Set((Array.isArray(relatedBooks) ? relatedBooks : [])
        .filter(Boolean)
        .map((b) => { var _a, _b; return String((_b = (_a = b._id) !== null && _a !== void 0 ? _a : b.id) !== null && _b !== void 0 ? _b : ""); })
        .filter((id) => id));
    return cards.filter((c) => {
        if (!c || c.type !== "book")
            return true;
        if (!c.id)
            return false;
        return allowedIds.has(String(c.id));
    });
}
function extractKeywords(raw) {
    const q = (raw || "").trim();
    const lower = q.toLowerCase();
    const stop = new Set([
        "mình",
        "tôi",
        "bạn",
        "cho",
        "xin",
        "nhờ",
        "giúp",
        "với",
        "là",
        "về",
        "có",
        "không",
        "nào",
        "đó",
        "được",
        "một",
        "các",
        "những",
        "sách",
        "book",
        "find",
        "search",
        "tìm",
        "kiếm",
        "gợi",
        "ý",
        "recommend",
    ]);
    const words = lower
        .split(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/i)
        .map((w) => w.trim())
        .filter((w) => w.length >= 2 && !stop.has(w));
    const synonyms = {
        code: ["code", "coding", "lập trình", "programming", "developer", "dev"],
        lập: ["lập trình", "programming", "coding"],
        trình: ["lập trình", "programming", "coding"],
        javascript: [
            "javascript",
            "js",
            "node",
            "nodejs",
            "react",
            "typescript",
            "ts",
        ],
        python: ["python", "django", "flask"],
        java: ["java", "spring"],
        sql: ["sql", "database", "cơ sở dữ liệu", "mysql", "postgres", "mongodb"],
        cook: ["nấu ăn", "món ăn", "ẩm thực", "cooking", "recipe", "cookbook"],
    };
    const expanded = new Set();
    for (const w of words) {
        expanded.add(w);
        for (const vals of Object.values(synonyms)) {
            if (vals.includes(w))
                vals.forEach((v) => expanded.add(v));
        }
        if (synonyms[w])
            synonyms[w].forEach((v) => expanded.add(v));
    }
    return {
        keywords: Array.from(expanded).slice(0, 12),
        searchQuery: words.slice(0, 6).join(" "),
    };
}
function normalizeForSearch(input) {
    return (input || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function buildSlugRegexFromQuery(query) {
    const norm = normalizeForSearch(query);
    if (!norm)
        return null;
    const parts = norm.split(" ").filter(Boolean).slice(0, 6);
    if (parts.length === 0)
        return null;
    const pattern = parts
        .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(".*");
    return new RegExp(pattern, "i");
}
function parseMoneyVnd(raw) {
    const s = (raw || "").toLowerCase().replace(/\s+/g, " ").trim();
    const m = s.match(/(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngan|tr|triệu|trieu)?/i);
    if (!m)
        return null;
    const num = parseFloat(String(m[1]).replace(",", "."));
    if (Number.isNaN(num))
        return null;
    const unit = (m[2] || "").toLowerCase();
    if (unit === "k" || unit === "nghìn" || unit === "ngan")
        return Math.round(num * 1000);
    if (unit === "tr" || unit === "triệu" || unit === "trieu")
        return Math.round(num * 1000000);
    return Math.round(num);
}
function parseBookFilters(query) {
    const q = (query || "").toLowerCase();
    const featured = /(nổi\s*bật|featured)/i.test(q) ? true : undefined;
    const bestSeller = /(bán\s*chạy|best\s*-?\s*seller|hot)/i.test(q)
        ? true
        : undefined;
    const newest = /(mới\s*nhất|newest|mới\s*ra)/i.test(q) ? true : undefined;
    const highRating = /(đánh\s*giá\s*cao|rating\s*cao|review\s*tốt|5\s*sao|4\.5)/i.test(q)
        ? true
        : undefined;
    let priceMin;
    let priceMax;
    const between = q.match(/từ\s+([^ ]+(?:\s*(?:k|nghìn|ngan|tr|triệu|trieu)?)?)\s+đến\s+([^ ]+(?:\s*(?:k|nghìn|ngan|tr|triệu|trieu)?)?)/i);
    if (between) {
        const a = parseMoneyVnd(between[1]);
        const b = parseMoneyVnd(between[2]);
        if (a != null && b != null) {
            priceMin = Math.min(a, b);
            priceMax = Math.max(a, b);
        }
    }
    const under = q.match(/(dưới|<)\s*([^ ]+(?:\s*(?:k|nghìn|ngan|tr|triệu|trieu)?)?)/i);
    if (!priceMax && under) {
        const v = parseMoneyVnd(under[2]);
        if (v != null)
            priceMax = v;
    }
    const over = q.match(/(trên|>=|>)\s*([^ ]+(?:\s*(?:k|nghìn|ngan|tr|triệu|trieu)?)?)/i);
    if (!priceMin && over) {
        const v = parseMoneyVnd(over[2]);
        if (v != null)
            priceMin = v;
    }
    if (/(giá\s*rẻ|rẻ)/i.test(q) && !priceMax)
        priceMax = 150000;
    return { featured, bestSeller, newest, highRating, priceMin, priceMax };
}
function guessCategorySlugsFromQuery(query) {
    const q = normalizeForSearch(query);
    const slugs = new Set();
    if (/(lap trinh|programming|coding|code|developer|dev|javascript|typescript|node|react|python|java|sql)/i.test(q)) {
        slugs.add("cong-nghe");
    }
    if (/(nau an|mon an|am thuc|cook|cooking|recipe|bep|cong thuc)/i.test(q)) {
        slugs.add("nau-an");
    }
    if (/(nuoc ngoai|foreign)/i.test(q)) {
        slugs.add("van-hoc-nuoc-ngoai");
    }
    return Array.from(slugs);
}
module.exports.queryAI = (question, context, relatedBooks) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("GROQ_API_KEY không được cấu hình");
        }
        const systemPrompt = `Bạn là trợ lý CSKH cho BookHive (website bán sách).

QUY TẮC BẮT BUỘC:
1) Chỉ trả lời trong phạm vi hệ thống BookHive: sách (tìm/gợi ý/chi tiết), giỏ hàng, đơn hàng, thanh toán, đăng nhập/đăng ký, tài khoản người dùng.
2) Nếu người dùng hỏi ngoài phạm vi, trả lời "out_of_scope" và hỏi lại hoặc gợi ý các dịch vụ BookHive có liên quan. Không bịa.
3) Nếu người dùng gửi lời chào (hello, xin chào, hi, tạm biệt, etc.) mà không liên quan đến hệ thống → intent = "general_help" và trả lời lịch sự, thân thiện. Ví dụ: "Xin chào bạn! 👋 Tôi có thể giúp bạn tìm sách, xem giỏ hàng, theo dõi đơn hàng hoặc hỗ trợ các vấn đề khác liên quan đến BookHive. Bạn cần gì?"
4) Luôn trả về DUY NHẤT một JSON hợp lệ (không markdown, không text thừa) theo schema:
{
  "message": "string tiếng Việt",
  "intent": "books_search|books_recommend|book_detail|cart|order|payment|auth_login|auth_register|general_help|out_of_scope",
  "actions": [{"type":"link|api","label":"string","href?":"string","method?":"GET|POST|PUT|PATCH|DELETE","apiPath?":"string"}],
  "cards": [{"type":"book|info", ...}]
}
5) TUYỆT ĐỐI KHÔNG bịa sách/giá/ảnh/link. Cards type="book" CHỈ được tạo nếu có sách trong "Thông tin liên quan" và chỉ dùng đúng dữ liệu đó.
6) Link trong hệ thống: chi tiết sách dùng đường dẫn dạng "/books/detail/<slug>". Các trang chung: "/books", "/cart", "/orders", "/cart/checkout", "/auth/login", "/auth/register".`;
        const userContent = context
            ? `Câu hỏi: ${question}\n\nThông tin liên quan:\n${context}`
            : `Câu hỏi: ${question}`;
        const response = yield axios_1.default.post("https://api.groq.com/openai/v1/chat/completions", {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent },
            ],
            max_tokens: 500,
            temperature: 0.2,
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
        });
        const raw = (_d = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content;
        if (!raw) {
            throw new Error("Không nhận được phản hồi từ Groq");
        }
        const parsed = safeJsonParse(raw.trim());
        const fallbackIntent = detectIntent(question);
        const hasBooks = Array.isArray(relatedBooks) && relatedBooks.length > 0;
        let message = "";
        let intent = fallbackIntent;
        let actions = [];
        if (parsed === null || parsed === void 0 ? void 0 : parsed.message) {
            message = parsed.message;
            intent = parsed.intent || fallbackIntent;
            actions =
                Array.isArray(parsed.actions) && parsed.actions.length > 0
                    ? parsed.actions
                    : buildDefaultActions(intent, hasBooks);
        }
        else {
            if (fallbackIntent === "out_of_scope" || fallbackIntent === "general_help") {
                message =
                    "Xin lỗi, nhưng câu hỏi của bạn không rõ ràng. Bạn có thể cần tìm kiếm sách hoặc cần hỗ trợ gì khác không?";
            }
            else {
                message = "Xin lỗi, tôi không thể xử lý câu hỏi này lúc này. Vui lòng thử lại.";
            }
            intent = fallbackIntent;
            actions = buildDefaultActions(fallbackIntent, hasBooks);
        }
        const structured = {
            message,
            intent,
            actions,
            cards: [],
        };
        return {
            success: true,
            answer: structured.message,
            ui: structured,
            context_used: !!context,
        };
    }
    catch (error) {
        console.error("AI Service Error:", ((_e = error.response) === null || _e === void 0 ? void 0 : _e.data) || error.message);
        return {
            success: false,
            error: ((_h = (_g = (_f = error.response) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.error) === null || _h === void 0 ? void 0 : _h.message) ||
                error.message ||
                "Lỗi khi xử lý câu hỏi",
        };
    }
});
module.exports.findRelatedBooks = (Book_1, query_1, ...args_1) => __awaiter(void 0, [Book_1, query_1, ...args_1], void 0, function* (Book, query, options = {}) {
    try {
        const limit = options.limit || 5;
        const { keywords } = extractKeywords(query);
        const filters = parseBookFilters(query);
        let books = [];
        const slugRegex = buildSlugRegexFromQuery(query);
        const guessedCategorySlugs = guessCategorySlugsFromQuery(query);
        const baseFind = { deleted: false, status: "active" };
        if (filters.featured)
            baseFind.featured = true;
        if (filters.newest)
            baseFind.newest = true;
        if (filters.priceMin != null || filters.priceMax != null) {
            baseFind.priceBuy = {};
            if (filters.priceMin != null)
                baseFind.priceBuy.$gte = filters.priceMin;
            if (filters.priceMax != null)
                baseFind.priceBuy.$lte = filters.priceMax;
        }
        if (filters.highRating) {
            baseFind.rating = { $gte: 4.5 };
        }
        let sort = {};
        if (filters.bestSeller)
            sort.soldCount = -1;
        if (filters.featured)
            sort.featured = -1;
        if (filters.newest)
            sort.createdAt = -1;
        if (filters.highRating)
            sort.rating = -1;
        if (Object.keys(sort).length === 0) {
            sort = { soldCount: -1, featured: -1, createdAt: -1 };
        }
        const buildTextOr = (regex) => [
            { title: regex },
            { author: regex },
            { description: regex },
            ...(slugRegex ? [{ slug: slugRegex }] : []),
        ];
        if (filters.bestSeller ||
            filters.featured ||
            filters.newest ||
            filters.highRating) {
            books = yield Book.find(baseFind).sort(sort).limit(limit);
            if (books && books.length > 0) {
                return books;
            }
        }
        if (guessedCategorySlugs.length > 0) {
            const cats = yield Category.find({
                deleted: false,
                status: "active",
                slug: { $in: guessedCategorySlugs },
            }).select("_id slug");
            const catIds = (cats || [])
                .map((c) => { var _a; return String((_a = c._id) !== null && _a !== void 0 ? _a : ""); })
                .filter((id) => id);
            if (catIds.length > 0) {
                books = yield Book.find(Object.assign(Object.assign({}, baseFind), { category_id: { $in: catIds } }))
                    .sort(sort)
                    .limit(limit);
            }
        }
        if (keywords.length > 0) {
            const pattern = keywords
                .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
                .join("|");
            const regex = new RegExp(pattern, "i");
            if (!books || books.length === 0) {
                books = yield Book.find(Object.assign(Object.assign({}, baseFind), { $or: [
                        { title: regex },
                        { author: regex },
                        { description: regex },
                        ...(slugRegex ? [{ slug: slugRegex }] : []),
                    ] }))
                    .sort(sort)
                    .limit(limit);
            }
        }
        else {
            const regex = new RegExp(query, "i");
            if (!books || books.length === 0) {
                books = yield Book.find(Object.assign(Object.assign({}, baseFind), { $or: [
                        { title: regex },
                        { author: regex },
                        { description: regex },
                        ...(slugRegex ? [{ slug: slugRegex }] : []),
                    ] }))
                    .sort(sort)
                    .limit(limit);
            }
        }
        if ((!books || books.length === 0) && keywords.length > 0) {
            const pattern = keywords
                .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
                .join("|");
            const regex = new RegExp(pattern, "i");
            books = yield Book.find({
                deleted: false,
                status: "active",
                $or: [
                    { title: regex },
                    { author: regex },
                    { description: regex },
                ],
            })
                .sort({ soldCount: -1, featured: -1, createdAt: -1 })
                .limit(limit);
        }
        if (!books || books.length === 0) {
            books = yield Book.find({ deleted: false, status: "active" })
                .sort(sort)
                .limit(limit);
        }
        return books || [];
    }
    catch (error) {
        console.error("Error finding related books:", error.message);
        return [];
    }
});
module.exports.buildContext = (books) => {
    if (!books || books.length === 0) {
        return null;
    }
    return books
        .map((book, idx) => `${idx + 1}. "${book.title}" - Tác giả: ${book.author}
       Giá: ${book.priceBuy}đ | Đánh giá: ${book.rating}/5 (${book.reviews} đánh giá)
       Mô tả: ${book.description || "Không có mô tả"}`)
        .join("\n\n");
};
