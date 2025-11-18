import api from "./axios";

// Lấy danh sách sân của OWNER
export const getMyFields = async () => {
  const res = await api.get("/owner/fields");
  return res.data.data;
};

// Tạo sân mới
export const createField = async (data: any) => {
  const token = localStorage.getItem("token");

  const res = await api.post("/owner/fields", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
// Xoá sân theo ID
export async function deleteField(id: number, token: string) {
  return api.delete(`/owner/fields/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
