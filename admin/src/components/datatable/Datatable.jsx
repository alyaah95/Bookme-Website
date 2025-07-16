import { DataGrid } from "@mui/x-data-grid";
// import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
// 🗑️ No longer need useFetch hook as we'll handle fetching directly with axios for pagination
// import useFetch from "../../hooks/useFetch"; // هذا السطر يمكن حذفه إذا لم يستخدم في أي مكان آخر
import API from "../../api/axiosInstance";

import "./datatable.scss";

// 🚀 The 'columns' prop is crucial here, and we'll add a 'listType' prop
const Datatable = ({ columns, listType }) => { // 🚀 تمت إضافة listType لتحديد نوع البيانات (فنادق، غرف، مستخدمين)
  const location = useLocation();
  const path = location.pathname.split("/")[1]; // على سبيل المثال: "hotels", "rooms", "users"

  // 🚀 حالات للتحكم في الـ pagination والبيانات
  const [data, setData] = useState([]); // 🚀 تم تغيير اسم 'list' إلى 'data' لتوضيح التوافق مع DataGrid
  const [loading, setLoading] = useState(true); // 🚀 الحالة الأولية للتحميل
  const [error, setError] = useState(null); // 🚀 حالة الأخطاء
  const [page, setPage] = useState(0); // 🚀 DataGrid يستخدم فهرس الصفحة يبدأ من 0
  const [pageSize, setPageSize] = useState(9); // 🚀 حجم الصفحة الأولي، متوافق مع pageSize الحالي لديكِ
  const [rowCount, setRowCount] = useState(0); // 🚀 العدد الإجمالي للصفوف من الـ backend

  // 🗑️ تم حذف استخدام useFetch الأصلي ودالة useEffect التي تعتمد عليه
  // const [list, setList] = useState([]);
  // const { data } = useFetch(`/${path}`);
  // useEffect(() => {
  //   setList(data);
  // }, [data]);

  // 🚀 دالة useEffect جديدة لجلب البيانات مع pagination للوحة تحكم الأدمن
  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true); // 🚀 تعيين حالة التحميل إلى true قبل جلب البيانات
      setError(null);   // 🚀 مسح أي أخطاء سابقة

      try {
        // 🚀 بناء مسار الـ endpoint الخاص بالأدمن
        // هنا التغيير الرئيسي: تم إزالة `/api/` من بداية الـ URL
        const apiUrl = `/${path}/admin?page=${page + 1}&limit=${pageSize}`; // 🚀🗑️ تم التعديل من `/api/${path}/admin` إلى `/${path}/admin`
        const res = await API.get(apiUrl);

        // 🚀 تحديث البيانات، العدد الإجمالي، وإعادة تعيين حالة التحميل
        if (path === "hotels") {
          setData(res.data.hotels);
          setRowCount(res.data.total);
        } else if (path === "rooms") {
          setData(res.data.rooms);
          setRowCount(res.data.total);
        } else if (path === "users") {
          setData(res.data.users);
          
          setRowCount(res.data.total);
        } else {
            // 🚀 إجراء احتياطي لأي أنواع أخرى، على الرغم من أن هذه هي الأنواع الرئيسية الثلاثة
            setData(res.data);
            setRowCount(res.data.length); 
        }
      } catch (err) {
        setError(err); // 🚀 تعيين حالة الخطأ إذا فشل الجلب
        console.error("Error fetching admin data:", err);
        console.log(data)
      } finally {
        setLoading(false); // 🚀 تعيين حالة التحميل إلى false بعد اكتمال الجلب (سواء نجاح أو فشل)
      }
    };

    fetchAdminData();
  }, [path, page, pageSize]); // 🚀 إعادة الجلب كلما تغير الـ path أو الصفحة الحالية أو حجم الصفحة


  // const handleRoomDelete = async (id) => {
  //   try {
  //     // 🚀 هنا أيضاً تم تعديل استدعاء الـ API ليناسب الهيكل الجديد بدون تكرار /api/
  //     const response = await API.get(`rooms/hotelId/${id}`); // 🚀🗑️ تم التعديل
  //     const hotelId = response.data; 

  //     // 🚀 تم تعديل مسار الحذف أيضاً
  //     await API.delete(`/${path}/${id}/${hotelId}`); // 🚀🗑️ تم التعديل
  //     setData(data.filter((item) => item._id !== id)); 
  //     setRowCount((prev) => prev - 1); 
  //   } catch (err) {
  //     console.error("Error deleting room:", err);
  //   }
  // };

const handleRoomDelete = async (id) => {
  try {
    const response = await axios.get(`/rooms/${id}/hotel`);
    const hotelId = response.data.hotelId;

    console.log("Deleting room:", id);
    console.log("Hotel ID:", hotelId);

    await axios.delete(`/rooms/${id}/${hotelId}`);
    setList(list.filter((item) => item._id !== id));
  } catch (err) {
    console.error("Delete failed:", err);
  }
};




  const handleDelete = async (id) => {
    try {
      // 🚀 تم تعديل مسار الحذف هنا أيضاً
      await API.delete(`/${path}/${id}`); // 🚀🗑️ تم التعديل
      setData(data.filter((item) => item._id !== id)); 
      setRowCount((prev) => prev - 1); 
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  // 🚀 منطق موحد لعمود الإجراءات
  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            {/* 🚀 رابط لعرض التفاصيل، بافتراض أن المسار هو /hotels/:id، /users/:id إلخ. */}
            {path === "users" ? ( // 🚀 إظهار "View" للمستخدمين فقط
              <Link to={`/${path}/${params.row._id}`} style={{ textDecoration: "none" }}>
                <div className="viewButton">View</div>
              </Link>
            ) : (
                // 🗑️ تم إزالة الرابط المتكرر للمسارات الأخرى إذا لم يكن مطلوبًا
                // إذا كنتِ بحاجة لرابط عرض للفنادق/الغرف، قومي بإلغاء التعليق والتعديل:
                // <Link to={`/${path}/${params.row._id}`} style={{ textDecoration: "none" }}>
                //   <div className="viewButton">View</div>
                // </Link>
                null
            )}
            
            {/* 🚀 حذف مشروط بناءً على المسار */}
            {path === "rooms" ? (
              <div className="deleteButton" onClick={() => handleRoomDelete(params.row._id)}>
                Delete
              </div>
            ) : (
              <div className="deleteButton" onClick={() => handleDelete(params.row._id)}>
                Delete
              </div>
            )}
          </div>
        );
      },
    },
  ];

  // 🗑️ تم إزالة تكرار userActionColumn و actionColumn
  // const userActionColumn = [...]
  // const actionColumn = [...]
  // const combinedColumns = path === "users" ? columns.concat(userActionColumn) : columns.concat(actionColumn);

  // 🚀 الآن، الأعمدة سيتم دمجها دائماً مع 'actionColumn' الواحدة
  const combinedColumns = columns.concat(actionColumn);

  return (
    <div className="datatable">
      <div className="datatableTitle">
        {/* 🚀 لجعل العنوان أكثر وضوحًا للمستخدم */}
        {listType === "hotels" ? "Hotels" : listType === "rooms" ? "Rooms" : listType === "users" ? "Users" : "List"}
        <Link to={`/${path}/new`} className="link">
          Add New {listType === "hotels" ? "Hotel" : listType === "rooms" ? "Room" : listType === "users" ? "User" : "Item"}
        </Link>
      </div>
      {error ? (
        <p>Error loading data: {error.message}</p> // 🚀 عرض رسالة الخطأ
      ) : (
        <DataGrid
          className="datagrid"
          rows={data} // 🚀 استخدام حالة 'data' الآن
          columns={combinedColumns}
          pageSize={pageSize} // 🚀 حجم الصفحة الحالي
          rowCount={rowCount} // 🚀 إجمالي الصفوف من الـ backend لواجهة المستخدم الخاصة بالـ pagination
          paginationMode="server" // 🚀 مهم جداً: لتفعيل الـ pagination من جانب السيرفر
          onPageChange={(newPage) => setPage(newPage)} // 🚀 تحديث حالة الصفحة عند تغييرها
          onPageSizeChange={(newSize) => setPageSize(newSize)} // 🚀 تحديث حجم الصفحة
          rowsPerPageOptions={[5, 9, 10, 25, 50]} // 🚀 خيارات أكثر مرونة لحجم الصفحة
          checkboxSelection
          getRowId={(row) => row._id}
          loading={loading} // 🚀 إظهار مؤشر التحميل
          autoHeight // 🚀 ضبط الارتفاع تلقائياً بناءً على المحتوى
        />
      )}
    </div>
  );
};

export default Datatable;