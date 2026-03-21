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
    if (/(chào|hi|hello|tạm biệt|bye|cảm ơn|thanks|ok|vâng|đúng|sai)/i.test(q))
        return "general_chat";
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
        case "general_chat":
        case "general_help":
            return [{ type: "link", label: "Khám phá tủ sách", href: "/books" }];
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
        cook: ["nấu ăn", "món ăn", "ẩm thực", "cooking", "recipe", "cookbook", "vào bếp", "công thức"],
        children: ["thiếu nhi", "trẻ em", "ehon", "truyện tranh", "manga", "comic", "kids", "cổ tích"],
        business: ["kinh doanh", "marketing", "khởi nghiệp", "quản trị", "lãnh đạo", "startup", "finance", "tài chính"],
        history: ["lịch sử", "sử việt", "triều đại", "chiến tranh", "nhan vat lich su", "history"],
        education: ["giáo khoa", "tham khảo", "ngoại ngữ", "tiếng anh", "ielts", "toeic", "học tập", "sgk"],
        novel: ["tiểu thuyết", "truyện ngắn", "văn học", "tác phẩm", "novel"],
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
    if (/(lap trinh|programming|coding|code|developer|dev|javascript|typescript|node|react|python|java|sql|it|phan mem)/i.test(q)) {
        slugs.add("cong-nghe");
    }
    if (/(nau an|mon an|am thuc|cook|cooking|recipe|bep|cong thuc|noi tro)/i.test(q)) {
        slugs.add("nau-an");
    }
    if (/(trinh tham|bi an|detective|mystery|pha an|toi pham|trinh sat)/i.test(q)) {
        slugs.add("trinh-tham");
    }
    if (/(tam ly|psychology|hanh vi|tu duy|cam xuc|thau cam)/i.test(q)) {
        slugs.add("tam-ly-hoc");
    }
    if (/(lich su|su viet|history|trieu dai|co dai|chien tranh)/i.test(q)) {
        slugs.add("lich-su");
    }
    if (/(ky nang song|growth|phat trien|giao tiep|ung xu|thoi quen|atomic|habits|dac nhan tam)/i.test(q)) {
        slugs.add("ky-nang-song");
    }
    if (/(tieu thuyết|van hoc|truyen ngan|novel|kinh dien|tác phẩm)/i.test(q)) {
        slugs.add("tieu-thuyet");
        if (/(viet nam|trong nuoc)/i.test(q))
            slugs.add("van-hoc-viet-nam");
        if (/(nuoc ngoai|quoc te|dich)/i.test(q))
            slugs.add("van-hoc-nuoc-ngoai");
    }
    if (/(kinh doanh|marketing|khoi nghiep|quan tri|tai chinh|money|business|startup)/i.test(q)) {
        slugs.add("kinh-doanh");
    }
    if (/(thieu nhi|tre em|ehon|co tich|kids|hoc sinh)/i.test(q)) {
        slugs.add("thieu-nhi");
    }
    if (/(khoa hoc vien tuong|sci-fi|vu tru|thien van|tuong lai)/i.test(q)) {
        slugs.add("khoa-hoc-vien-tuong");
    }
    if (/(truyen tranh|manga|comic|anime)/i.test(q)) {
        slugs.add("truyen-tranh");
    }
    if (/(giao khoa|tham khao|sgk|luyen thi|on thi)/i.test(q)) {
        slugs.add("sach-giao-khoa");
        slugs.add("sach-tham-khao");
    }
    if (/(ngoai ngu|tieng anh|english|tieng nhat|tieng han|hoc tieng)/i.test(q)) {
        slugs.add("sach-hoc-ngoai-ngu");
    }
    if (/(nghe thuat|hoi hoa|am nhac|nhiep anh|thiet ke|art)/i.test(q)) {
        slugs.add("nghe-thuat");
    }
    if (/(chinh tri|phap luat|luat|hien phap|phap quy)/i.test(q)) {
        slugs.add("chinh-tri-phap-luat");
    }
    return Array.from(slugs);
}
module.exports.queryAI = (question, context, relatedBooks) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("GROQ_API_KEY không được cấu hình");
        }
        const systemPrompt = `Bạn là BOOK STYLIST - Chuyên gia tư vấn sách cao cấp của BookHive.
Triết lý: "Mỗi cuốn sách là một mảnh ghép tâm hồn, và tôi ở đây để giúp bạn tìm thấy mảnh ghép định mệnh".

1. AM HIỂU WEBSITE (KNOWLEDGE BASE):
- Giao hàng: Miễn phí nội thành TP.HCM (đơn >300k), 1-3 ngày toàn quốc.
- Thanh toán: COD, Chuyển khoản, MoMo, VNPAY.
- Đổi trả: Trong 7 ngày nếu sách lỗi sản xuất.
- Tài khoản: Cần đăng nhập để tích điểm (BookCoins).

2. TƯ DUY CHIẾN LƯỢC (REASONING):
- Khi khách hỏi, hãy phân tích "Tâm lý & Nhu cầu ngầm": Ví dụ khách thích "bí ẩn" thường có xu hướng tò mò, thích thử thách trí tuệ -> Gợi ý sách có plot twist mạnh.
- Nếu không có sách trong context phù hợp, hãy dùng kiến thức của bạn để thảo luận về chủ đề đó một cách sâu sắc, VÀ sau đó khéo léo giới thiệu các đầu sách liên quan XA mà shop có (ví dụ khách hỏi Kim Dung nhưng shop không có, hãy thảo luận về tinh thần kiếm hiệp và gợi ý tiểu thuyết lịch sử Việt Nam).
- Phải luôn giữ vai trò chuyên gia, không chỉ là bot trả lời.

3. QUY TẮC CỐT LÕI:
- Trò chuyện tinh tế, thấu cảm (Empathy). Sử dụng emoji sang trọng, không lạm dụng.
- ĐỒNG BỘ: Chỉ nhắc tên sách có trong Context. Hệ thống tự hiển thị Card.
- TUYỆT ĐỐI không tự viết danh sách liệt kê sách.

4. FORMAT JSON:
{
  "message": "Lời thoại của bạn. (Logic: Nhận xét -> Phân tích nhu cầu khách -> Gợi ý/Thảo luận tự nhiên)",
  "intent": "string",
  "actions": []
}`;
        const userContent = context
            ? `Câu hỏi: ${question}\n\nThông tin liên quan:\n${context}`
            : `Câu hỏi: ${question}`;
        const response = yield axios_1.default.post("https://api.groq.com/openai/v1/chat/completions", {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent },
            ],
            max_tokens: 800,
            temperature: 0.7,
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
            const aiContent = (_h = (_g = (_f = (_e = response.data) === null || _e === void 0 ? void 0 : _e.choices) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.message) === null || _h === void 0 ? void 0 : _h.content;
            if (aiContent && aiContent.length > 10) {
                message = aiContent.replace(/```json|```/g, "").trim();
            }
            else {
                message = "Rất tiếc, em gặp một chút trục trặc khi suy nghĩ. Anh có thể hỏi lại được không?";
            }
            intent = fallbackIntent;
            actions = buildDefaultActions(fallbackIntent, hasBooks);
        }
        const msgLower = message.toLowerCase();
        const finalCards = (relatedBooks || [])
            .filter((book) => {
            const title = (book.title || "").toLowerCase();
            if (title.length < 3)
                return false;
            return msgLower.includes(title);
        })
            .map((book) => {
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
        const structured = {
            message,
            intent,
            actions,
            cards: finalCards,
        };
        return {
            success: true,
            answer: structured.message,
            ui: structured,
            context_used: !!context,
        };
    }
    catch (error) {
        console.error("AI Service Error:", ((_j = error.response) === null || _j === void 0 ? void 0 : _j.data) || error.message);
        return {
            success: false,
            error: ((_m = (_l = (_k = error.response) === null || _k === void 0 ? void 0 : _k.data) === null || _l === void 0 ? void 0 : _l.error) === null || _m === void 0 ? void 0 : _m.message) ||
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
            const isGeneral = !query ||
                keywords.length === 0 ||
                /(sách|book|gợi ý|recommend|truyện)/i.test(query);
            if (isGeneral) {
                books = yield Book.find({ deleted: false, status: "active" })
                    .sort(sort)
                    .limit(limit);
            }
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
        return "Hiện tại kho sách chưa tìm thấy đầu sách khớp hoàn toàn với mô tả. Hãy dùng kiến thức chuyên gia của bạn để thảo luận và gợi ý các hướng đọc khác (ví dụ: cùng tác giả, cùng thể loại, hoặc sách có giá trị tương đương).";
    }
    const websiteInfo = `
   CHÍNH SÁCH WEBSITE:
   - Tình trạng: Tất cả sách là Hàng mới 100%, Chính hãng.
   - Ưu đãi: Giảm 10% cho thành viên mới.
   - Hotline hỗ trợ: 1900-2026.
  `;
    const booksData = books
        .map((book, idx) => `SÁCH #${idx + 1}:
         - Tiêu đề: "${book.title}"
         - Tác giả: ${book.author}
         - Giá: ${book.priceBuy}đ (Giá gốc: ${book.priceDefault || book.priceBuy}đ)
         - Đánh giá: ${book.rating}/5 sao
         - Đã bán: ${book.soldCount || 0} cuốn
         - Mô tả: ${book.description || "Đang cập nhật nội dung..."}`)
        .join("\n\n");
    return `${websiteInfo}\n\nDANH SÁCH SÁCH TỪ HỆ THỐNG:\n${booksData}`;
};
