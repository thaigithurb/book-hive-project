import axios from "axios";
const Category = require("../../models/category.model");

interface QueryContextOptions {
  limit?: number;
  format?: string;
}

type UiAction = {
  type: "link" | "api";
  label: string;
  href?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  apiPath?: string;
};

type UiCard =
  | {
      type: "book";
      id: string;
      title: string;
      author?: string;
      image?: string;
      price?: number;
      rating?: number;
      slug?: string;
      href?: string;
    }
  | {
      type: "info";
      title: string;
      description?: string;
      href?: string;
    };

type AiStructuredResponse = {
  message: string;
  intent:
    | "books_search"
    | "books_recommend"
    | "book_detail"
    | "cart"
    | "order"
    | "payment"
    | "auth_login"
    | "auth_register"
    | "general_help"
    | "out_of_scope";
  actions?: UiAction[];
  cards?: UiCard[];
};

function stripCodeFences(raw: string) {
  if (!raw) return raw;
  let s = raw.trim();
  // Remove leading/trailing backticks fences like ```json ... ```
  s = s
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  // Some models add a trailing single backtick by mistake
  s = s.replace(/`+$/g, "").trim();
  return s;
}

function extractFirstJsonObject(raw: string) {
  const s = stripCodeFences(raw);
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return s.slice(start, end + 1);
}

function safeJsonParse<T>(input: string): T | null {
  const direct = stripCodeFences(input);
  const candidate = direct.startsWith("{")
    ? direct
    : extractFirstJsonObject(direct);
  if (!candidate) return null;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

function detectIntent(questionRaw: string): AiStructuredResponse["intent"] {
  const q = (questionRaw || "").toLowerCase();
  if (/(đăng\s*nhập|login|log\s*in)/i.test(q)) return "auth_login";
  if (/(đăng\s*ký|register|sign\s*up)/i.test(q)) return "auth_register";
  if (/(giỏ\s*hàng|cart|thêm\s*vào\s*giỏ|xóa\s*khỏi\s*giỏ)/i.test(q))
    return "cart";
  if (/(đơn\s*hàng|order|trạng\s*thái\s*đơn|hủy\s*đơn)/i.test(q))
    return "order";
  if (/(thanh\s*toán|payment|vnpay|momo|cod|chuyển\s*khoản)/i.test(q))
    return "payment";
  if (/(gợi\s*ý|recommend|đề\s*xuất)/i.test(q)) return "books_recommend";
  if (/(tìm|search|kiếm|sách|book)/i.test(q)) return "books_search";
  return "general_help";
}

function buildDefaultActions(
  intent: AiStructuredResponse["intent"],
  hasBooks: boolean = false,
): UiAction[] {
  switch (intent) {
    case "books_search":
    case "books_recommend":
    case "book_detail":
      // If no books found, show "View More" button to /books
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

function buildBookCards(books: any[]): UiCard[] {
  if (!Array.isArray(books) || books.length === 0) return [];
  return books.filter(Boolean).map((book: any) => ({
    type: "book",
    id: String(book._id ?? book.id ?? ""),
    title: book.title,
    author: book.author,
    image: book.image,
    price: book.priceBuy,
    rating: book.rating,
    slug: book.slug,
    href: book.slug ? `/books/detail/${book.slug}` : undefined,
  }));
}

function filterToRelatedBookCards(
  cards: UiCard[] | undefined,
  relatedBooks: any[],
) {
  if (!Array.isArray(cards) || cards.length === 0) return [];
  const allowedIds = new Set(
    (Array.isArray(relatedBooks) ? relatedBooks : [])
      .filter(Boolean)
      .map((b: any) => String(b._id ?? b.id ?? ""))
      .filter((id: string) => id),
  );

  return cards.filter((c) => {
    if (!c || c.type !== "book") return true;
    if (!c.id) return false;
    return allowedIds.has(String(c.id));
  });
}

function extractKeywords(raw: string) {
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
    .split(
      /[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/i,
    )
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !stop.has(w));

  const synonyms: Record<string, string[]> = {
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

  const expanded = new Set<string>();
  for (const w of words) {
    expanded.add(w);
    for (const vals of Object.values(synonyms)) {
      if (vals.includes(w)) vals.forEach((v) => expanded.add(v));
    }
    if (synonyms[w]) synonyms[w].forEach((v) => expanded.add(v));
  }

  return {
    keywords: Array.from(expanded).slice(0, 12),
    searchQuery: words.slice(0, 6).join(" "),
  };
}

function normalizeForSearch(input: string) {
  // Lowercase + remove Vietnamese diacritics (works for most Latin-based languages)
  return (input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSlugRegexFromQuery(query: string) {
  const norm = normalizeForSearch(query);
  if (!norm) return null;
  // turn "sach mon an" -> /sach.*mon.*an/i to match slugs like "sach-mon-an-ngon"
  const parts = norm.split(" ").filter(Boolean).slice(0, 6);
  if (parts.length === 0) return null;
  const pattern = parts
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(pattern, "i");
}

function parseMoneyVnd(raw: string) {
  // supports: 100k, 100000, 1tr, 1 triệu, 1.2tr
  const s = (raw || "").toLowerCase().replace(/\s+/g, " ").trim();
  const m = s.match(/(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngan|tr|triệu|trieu)?/i);
  if (!m) return null;
  const num = parseFloat(String(m[1]).replace(",", "."));
  if (Number.isNaN(num)) return null;
  const unit = (m[2] || "").toLowerCase();
  if (unit === "k" || unit === "nghìn" || unit === "ngan")
    return Math.round(num * 1_000);
  if (unit === "tr" || unit === "triệu" || unit === "trieu")
    return Math.round(num * 1_000_000);
  // default assume VND if number is already large, otherwise treat as VND
  return Math.round(num);
}

function parseBookFilters(query: string) {
  const q = (query || "").toLowerCase();

  const featured = /(nổi\s*bật|featured)/i.test(q) ? true : undefined;
  const bestSeller = /(bán\s*chạy|best\s*-?\s*seller|hot)/i.test(q)
    ? true
    : undefined;
  const newest = /(mới\s*nhất|newest|mới\s*ra)/i.test(q) ? true : undefined;
  const highRating =
    /(đánh\s*giá\s*cao|rating\s*cao|review\s*tốt|5\s*sao|4\.5)/i.test(q)
      ? true
      : undefined;

  // price filters: "dưới 200k", "trên 100k", "từ 100k đến 300k"
  let priceMin: number | undefined;
  let priceMax: number | undefined;

  const between = q.match(
    /từ\s+([^ ]+(?:\s*(?:k|nghìn|ngan|tr|triệu|trieu)?)?)\s+đến\s+([^ ]+(?:\s*(?:k|nghìn|ngan|tr|triệu|trieu)?)?)/i,
  );
  if (between) {
    const a = parseMoneyVnd(between[1]);
    const b = parseMoneyVnd(between[2]);
    if (a != null && b != null) {
      priceMin = Math.min(a, b);
      priceMax = Math.max(a, b);
    }
  }

  const under = q.match(
    /(dưới|<)\s*([^ ]+(?:\s*(?:k|nghìn|ngan|tr|triệu|trieu)?)?)/i,
  );
  if (!priceMax && under) {
    const v = parseMoneyVnd(under[2]);
    if (v != null) priceMax = v;
  }

  const over = q.match(
    /(trên|>=|>)\s*([^ ]+(?:\s*(?:k|nghìn|ngan|tr|triệu|trieu)?)?)/i,
  );
  if (!priceMin && over) {
    const v = parseMoneyVnd(over[2]);
    if (v != null) priceMin = v;
  }

  // "giá rẻ" heuristic
  if (/(giá\s*rẻ|rẻ)/i.test(q) && !priceMax) priceMax = 150_000;

  return { featured, bestSeller, newest, highRating, priceMin, priceMax };
}

function guessCategorySlugsFromQuery(query: string) {
  const q = normalizeForSearch(query);
  const slugs = new Set<string>();

  // Technology / programming
  if (
    /(lap trinh|programming|coding|code|developer|dev|javascript|typescript|node|react|python|java|sql)/i.test(
      q,
    )
  ) {
    slugs.add("cong-nghe");
  }

  // Cooking
  if (/(nau an|mon an|am thuc|cook|cooking|recipe|bep|cong thuc)/i.test(q)) {
    slugs.add("nau-an");
  }

  // Foreign literature (common phrasing: "nước ngoài" without diacritics becomes "nuoc ngoai")
  if (/(nuoc ngoai|foreign)/i.test(q)) {
    slugs.add("van-hoc-nuoc-ngoai");
  }

  return Array.from(slugs);
}

/**
 * Service để handle AI queries với Groq API
 */
module.exports.queryAI = async (
  question: string,
  context?: string,
  relatedBooks?: any[],
) => {
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

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        max_tokens: 500,
        temperature: 0.2,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    const raw = response.data?.choices?.[0]?.message?.content;
    if (!raw) {
      throw new Error("Không nhận được phản hồi từ Groq");
    }

    const parsed = safeJsonParse<AiStructuredResponse>(raw.trim());
    const fallbackIntent = detectIntent(question);
    const hasBooks = Array.isArray(relatedBooks) && relatedBooks.length > 0;

    // Build structured response - only use AI message if properly parsed
    let message = "";
    let intent = fallbackIntent;
    let actions: UiAction[] = [];

    if (parsed?.message) {
      // AI returned valid JSON with message field
      message = parsed.message;
      intent = parsed.intent || fallbackIntent;
      actions =
        Array.isArray(parsed.actions) && parsed.actions.length > 0
          ? parsed.actions
          : buildDefaultActions(intent, hasBooks);
    } else {
      // JSON parse fail or no message field - return user-friendly fallback
      // When user asks something unclear/out of scope
      if (fallbackIntent === "out_of_scope" || fallbackIntent === "general_help") {
        message =
          "Xin lỗi, nhưng câu hỏi của bạn không rõ ràng. Bạn có thể cần tìm kiếm sách hoặc cần hỗ trợ gì khác không?";
      } else {
        message = "Xin lỗi, tôi không thể xử lý câu hỏi này lúc này. Vui lòng thử lại.";
      }
      intent = fallbackIntent;
      actions = buildDefaultActions(fallbackIntent, hasBooks);
    }

    const structured: AiStructuredResponse = {
      message,
      intent,
      actions,
      cards: [], // No book cards - simplified response
    };

    return {
      success: true,
      answer: structured.message,
      ui: structured,
      context_used: !!context,
    };
  } catch (error: any) {
    console.error("AI Service Error:", error.response?.data || error.message);
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.message ||
        "Lỗi khi xử lý câu hỏi",
    };
  }
};

/**
 * Tìm các cuốn sách liên quan dựa trên keyword
 */
module.exports.findRelatedBooks = async (
  Book: any,
  query: string,
  options: QueryContextOptions = {},
) => {
  try {
    const limit = options.limit || 5;
    const { keywords } = extractKeywords(query);
    const filters = parseBookFilters(query);

    let books: any[] = [];
    const slugRegex = buildSlugRegexFromQuery(query);
    const guessedCategorySlugs = guessCategorySlugsFromQuery(query);

    const baseFind: any = { deleted: false, status: "active" };
    if (filters.featured) baseFind.featured = true;
    if (filters.newest) baseFind.newest = true;
    if (filters.priceMin != null || filters.priceMax != null) {
      baseFind.priceBuy = {};
      if (filters.priceMin != null) baseFind.priceBuy.$gte = filters.priceMin;
      if (filters.priceMax != null) baseFind.priceBuy.$lte = filters.priceMax;
    }
    if (filters.highRating) {
      baseFind.rating = { $gte: 4.5 };
    }

    let sort: any = {};
    if (filters.bestSeller) sort.soldCount = -1;
    if (filters.featured) sort.featured = -1;
    if (filters.newest) sort.createdAt = -1;
    if (filters.highRating) sort.rating = -1;
    if (Object.keys(sort).length === 0) {
      sort = { soldCount: -1, featured: -1, createdAt: -1 };
    }

    const buildTextOr = (regex: RegExp) => [
      { title: regex },
      { author: regex },
      { description: regex },
      ...(slugRegex ? [{ slug: slugRegex }] : []),
    ];

    // ← THÊM: Pass đặc biệt - nếu detect filter pattern, chỉ apply filter + sort
    if (
      filters.bestSeller ||
      filters.featured ||
      filters.newest ||
      filters.highRating
    ) {
      books = await Book.find(baseFind).sort(sort).limit(limit);
      if (books && books.length > 0) {
        return books;
      }
    }

    // Pass 0: if query strongly implies a category, fetch books by that category first
    if (guessedCategorySlugs.length > 0) {
      const cats = await Category.find({
        deleted: false,
        status: "active",
        slug: { $in: guessedCategorySlugs },
      }).select("_id slug");

      const catIds = (cats || [])
        .map((c: any) => String(c._id ?? ""))
        .filter((id: string) => id);

      if (catIds.length > 0) {
        books = await Book.find({ ...baseFind, category_id: { $in: catIds } })
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
        // Search: title, author, description
        books = await Book.find({
          ...baseFind,
          $or: [
            { title: regex },
            { author: regex },
            { description: regex },
            ...(slugRegex ? [{ slug: slugRegex }] : []),
          ],
        })
          .sort(sort)
          .limit(limit);
      }
    } else {
      const regex = new RegExp(query, "i");
      if (!books || books.length === 0) {
        books = await Book.find({
          ...baseFind,
          $or: [
            { title: regex },
            { author: regex },
            { description: regex },
            ...(slugRegex ? [{ slug: slugRegex }] : []),
          ],
        })
          .sort(sort)
          .limit(limit);
      }
    }

    // Pass 2: nếu không ra kết quả do filter quá chặt, thử bỏ filter nhưng giữ từ khóa
    if ((!books || books.length === 0) && keywords.length > 0) {
      const pattern = keywords
        .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");
      const regex = new RegExp(pattern, "i");
      books = await Book.find({
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

    // Fallback: always return something
    if (!books || books.length === 0) {
      books = await Book.find({ deleted: false, status: "active" })
        .sort(sort)
        .limit(limit);
    }

    return books || [];
  } catch (error: any) {
    console.error("Error finding related books:", error.message);
    return [];
  }
};

/**
 * Build context string từ danh sách books
 */
module.exports.buildContext = (books: any[]) => {
  if (!books || books.length === 0) {
    return null;
  }

  return books
    .map(
      (book, idx) =>
        `${idx + 1}. "${book.title}" - Tác giả: ${book.author}
       Giá: ${book.priceBuy}đ | Đánh giá: ${book.rating}/5 (${book.reviews} đánh giá)
       Mô tả: ${book.description || "Không có mô tả"}`,
    )
    .join("\n\n");
};

export {};
