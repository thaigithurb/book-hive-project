"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface CartItem {
  bookId: unknow;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  slug: string;
  _id: any;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
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
        .get("http://localhost:3001/api/v1/cart", {
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
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.bookId === newItem.bookId,
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.bookId === newItem.bookId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item,
        );
      }
      return [...prevItems, newItem];
    });
    if (isAuthenticated) {
      const accessToken = localStorage.getItem("accessToken_user");
      axios.post("http://localhost:3001/api/v1/cart/add-item", newItem, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  };

  const removeFromCart = async (id: string) => {
    if (isAuthenticated) {
      const accessToken = localStorage.getItem("accessToken_user");
      try {
        const res = await axios.delete(
          `http://localhost:3001/api/v1/cart/delete/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        setItems(res.data.items || []);
      } catch (error) {
        toast.error("Xóa sản phẩm thất bại");
      }
    } else {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item._id === id ? { ...item, quantity } : item)),
    );
    if (isAuthenticated) {
      const accessToken = localStorage.getItem("accessToken_user");
      axios.patch(
        `http://localhost:3001/api/v1/cart/edit/${id}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    }
  };

  const clearCart = () => {
    setItems([]);
    if (isAuthenticated) {
      const accessToken = localStorage.getItem("accessToken_user");
      axios.delete("http://localhost:3001/api/v1/cart/delete-all", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
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
