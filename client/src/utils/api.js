import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true, // دي أهم واحدة! بتخلي الكوكيز تتبعت تلقائياً
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
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

export default api;