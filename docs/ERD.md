# Sơ đồ thực thể quan hệ (ERD) - Book Hive

Tài liệu này mô tả cấu trúc dữ liệu của dự án Book Hive sử dụng MongoDB.

```mermaid
erDiagram
    ACCOUNT ||--o{ BOOK : "createdBy/updatedBy"
    ACCOUNT ||--|| ROLE : "belongs to"
    ROLE ||--o{ ACCOUNT : "assigned to"
    CATEGORY ||--o{ BOOK : "categorizes"
    USER ||--o{ ORDER : "places"
    USER ||--o{ FAVORITE : "likes"
    USER ||--o{ REVIEW : "writes"
    BOOK ||--o{ REVIEW : "has"
    BOOK ||--o{ CART_ITEM : "included in"
    ORDER ||--o{ ORDER_ITEM : "contains"

    ACCOUNT {
        string _id PK
        string fullName
        string email
        string password
        string role_id FK
        string status
        boolean deleted
        date createdAt
    }

    USER {
        string _id PK
        string fullName
        string email
        string password
        string googleId
        string phone
        string status
        string slug
    }

    BOOK {
        string _id PK
        string title
        string author
        string category_id FK
        string description
        number priceBuy
        number rating
        string image
        string status
        string slug
    }

    CATEGORY {
        string _id PK
        string title
        string parent_id
        number position
        string status
        string slug
    }

    ORDER {
        string _id PK
        string orderCode
        object userInfo
        array items
        number totalAmount
        string paymentMethod
        string status
        date createdAt
    }

    ROLE {
        string _id PK
        string title
        string description
        array permissions
    }

    REVIEW {
        string _id PK
        string userId FK
        string bookId FK
        number rating
        string content
    }
```

## Các thực thể chính

1.  **Account**: Tài khoản quản trị hệ thống (Admin/Staff).
2.  **User**: Người dùng cuối (Khách hàng) mua sách.
3.  **Book**: Thông tin sản phẩm sách.
4.  **Category**: Danh mục sách (hỗ trợ phân cấp cha-con).
5.  **Order**: Thông tin đơn hàng và thanh toán.
6.  **Role**: Phân quyền cho các tài khoản quản trị.
7.  **Review**: Đánh giá của người dùng về sách.
