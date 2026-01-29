import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useFetchFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken_user");
    setIsLoggedIn(!!token);
    if (!token) {
      setFavoriteIds([]);
      return;
    }
    axios
      .get(`${API_URL}/api/v1/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const favorites = res.data.favorites || [];
        setFavoriteIds(favorites.map((fav: any) => fav.bookId?._id));
      })
      .catch(() => setFavoriteIds([]));
  }, []);

  return { favoriteIds, setFavoriteIds, isLoggedIn };
}
