import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function toggleFavorite(
  bookId: string,
  next: boolean,
): Promise<boolean> {
  const token = localStorage.getItem("accessToken_user");
  if (!token) return false;
  try {
    if (next) {
      await axios.post(
        `${API_URL}/api/v1/favorites/add`,
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return true;
    } else {
      await axios.delete(`${API_URL}/api/v1/favorites/remove`, {
        data: { bookId },
        headers: { Authorization: `Bearer ${token}` },
      });
      return false;
    }
  } catch {
    return false;
  }
}
