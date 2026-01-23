"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CartItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  slug: string;
  type: "buy" | "rent"; // NEW
  rentalType?: "day" | "week"; // NEW
  rentalDays?: number; // NEW
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  addToRent: (item: CartItem) => void; 
  removeFromCart: (id: string, type?: "buy" | "rent") => void;
  updateQuantity: (id: string, quantity: number, type?: "buy" | "rent") => void; 
  clearCart: () => void;
  getTotalItems: () => number;
  getBuyItems: () => CartItem[]; // NEW
  getRentItems: () => CartItem[]; // NEW
  getTotalBuyPrice: () => number; // NEW
  getTotalRentPrice: () => number; // NEW
  isAuthenticated: boolean;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken_user");
    setIsAuthenticated(!!accessToken);

    if (accessToken) {
      setIsLoading(true);
      axios
        .get(`${API_URL}/api/v1/cart`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          setItems(res.data.items || []);
          setIsLoaded(true);
          setIsLoading(false);
        })
        .catch(() => {
          setItems([]);
          setIsLoaded(true);
          setIsLoading(false);
        });
    } else {
      const savedCart = localStorage.getItem("guest_cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      setIsLoaded(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) {
      localStorage.setItem("guest_cart", JSON.stringify(items));
    } else localStorage.removeItem("guest_cart");
  }, [items, isLoaded, isAuthenticated]);

  const addToCart = (newItem: CartItem) => {
    newItem.type = "buy"; // UPDATED
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.bookId === newItem.bookId && item.type === "buy" // UPDATED
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.bookId === newItem.bookId && item.type === "buy" // UPDATED
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prevItems, newItem];
    });
    if (isAuthenticated) {
      const accessToken = localStorage.getItem("accessToken_user");
      axios.post(`${API_URL}/api/v1/cart/add-item`, newItem, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
    console.log(newItem);
  };

  // NEW: Thêm sách vào giỏ thuê
  const addToRent = (newItem: CartItem) => {
    newItem.type = "rent";
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) =>
          item.bookId === newItem.bookId &&
          item.type === "rent" &&
          item.rentalType === newItem.rentalType &&
          item.rentalDays === newItem.rentalDays
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.bookId === newItem.bookId &&
            item.type === "rent" &&
            item.rentalType === newItem.rentalType &&
            item.rentalDays === newItem.rentalDays
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prevItems, newItem];
    });
    if (isAuthenticated) {
      const accessToken = localStorage.getItem("accessToken_user");
      axios.post(`${API_URL}/api/v1/cart/add-rental`, newItem, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  };

  const removeFromCart = async (id: string, type: "buy" | "rent" = "buy") => {
    if (isAuthenticated) {
      const accessToken = localStorage.getItem("accessToken_user");
      try {
        const res = await axios.delete(`${API_URL}/api/v1/cart/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setItems(res.data.items || []);
      } catch (error) {
        toast.error("Xóa sản phẩm thất bại");
      }
    } else {
      setItems((prevItems) =>
        prevItems.filter((item) => !(item.bookId === id && item.type === type))
      );
    }
  };

  const updateQuantity = (
    id: string,
    quantity: number,
    type: "buy" | "rent" = "buy"
  ) => {
    if (quantity <= 0) {
      removeFromCart(id, type);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.bookId === id && item.type === type
          ? { ...item, quantity }
          : item
      )
    );
    if (isAuthenticated) {
      const accessToken = localStorage.getItem("accessToken_user");
      axios.patch(
        `${API_URL}/api/v1/cart/edit/${id}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    }
  };

  const clearCart = () => {
    setItems([]);
    if (isAuthenticated) {
      const accessToken = localStorage.getItem("accessToken_user");
      axios.delete(`${API_URL}/api/v1/cart/delete-all`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // NEW: Lấy items mua
  const getBuyItems = (): CartItem[] => {
    return items.filter((item) => item.type === "buy");
  };

  // NEW: Lấy items thuê
  const getRentItems = (): CartItem[] => {
    return items.filter((item) => item.type === "rent");
  };

  // NEW: Tính tổng tiền mua
  const getTotalBuyPrice = (): number => {
    return getBuyItems().reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  // NEW: Tính tổng tiền thuê
  const getTotalRentPrice = (): number => {
    return getRentItems().reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        addToRent, // NEW
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getBuyItems, 
        getRentItems,
        getTotalBuyPrice,
        getTotalRentPrice, 
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart phải được dùng trong CartProvider");
  }
  return context;
};