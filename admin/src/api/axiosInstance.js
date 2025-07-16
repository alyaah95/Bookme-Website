// src/api/axiosInstance.js
import axios from "axios";

// بننشئ نسخة مخصصة من axios
const API = axios.create({
  baseURL: "http://localhost:8800/api/", // 🚀 ده عنوان الـ Backend بتاعك الحقيقي
  withCredentials: true, // 🚀 مهم جداً: ده بيخلي الـ Cookies تتبعت مع الطلبات
});

export default API; // بنصدر النسخة دي عشان نستخدمها في أي مكان