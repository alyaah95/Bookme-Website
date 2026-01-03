// src/api/axiosInstance.js
import axios from "axios";

// بننشئ نسخة مخصصة من axios
const API = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:8800/api/", // 🚀 ده عنوان الـ Backend بتاعك الحقيقي
  withCredentials: true, // 🚀 مهم جداً: ده بيخلي الـ Cookies تتبعت مع الطلبات
});

API.interceptors.response.use(
  (response) => {
    return response; // لو الرد سليم، مرره عادي
  },
  (error) => {
    // لو السيرفر رجع 401 (غير مسجل دخول) أو 403 (انتهت الصلاحية أو غير مصرح)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      // 1. مسح بيانات المستخدم من الـ LocalStorage
      localStorage.removeItem("user");
      
      // 2. توجيه المستخدم لصفحة الـ Login
      // نستخدم window.location لضمان عمل إعادة تحميل كاملة وتصفير الـ Context
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export default API; // بنصدر النسخة دي عشان نستخدمها في أي مكان