import axios from "axios";
import { toast } from "react-toastify";

const accessToken = localStorage.getItem("accessToken");

export default function useChangeStatus(
  fetchData: () => void,
  resource: String
) {
  return async (id: string, currentStatus: string) => {
    let newStatus;
    if (currentStatus === "active") {
      newStatus = "inactive";
    } else if (currentStatus === "inactive") {
      newStatus = "active";
    } else {
      return;
    }
    try {
      await axios.patch(
        `http://localhost:3001/api/v1/admin/${resource}/change-status/${newStatus}/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      fetchData();
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.log(error);
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };
}
