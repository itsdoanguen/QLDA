import axios from "axios";

// Lấy Base URL từ biến môi trường (Ví dụ: http://localhost:3000/api)
// Gắn thêm /v1 để làm version chung cho toàn bộ API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  timeout: 60000, // Timeout sau 60s
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor Request: Tự động nhét accessToken vào mọi API gọi đi (nếu có)
// Nhờ cấu hình này, bạn không cần phải truyền `headers: { Authorization: ... }` ở các component nữa!
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor Response: Tự động bắt lỗi nếu accessToken hết hạn (Lỗi 401)
// và văng về trang Login tự động.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
