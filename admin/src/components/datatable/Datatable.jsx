import { DataGrid } from "@mui/x-data-grid";
// import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
// No longer need useFetch hook as we'll handle fetching directly with axios for pagination
// import useFetch from "../../hooks/useFetch";
import API from "../../api/axiosInstance";
import UpdateModal from "../updateModal/UpdateModal";
import Swal from 'sweetalert2';
import "./datatable.scss";

// The 'columns' prop is crucial here, and we'll add a 'listType' prop
const Datatable = ({ columns, listType }) => { 
  const location = useLocation();
  const path = location.pathname.split("/")[1];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(9);
  const [rowCount, setRowCount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);



  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true); 
      setError(null);  

      try {
       
        const apiUrl = `/${path}/admin?page=${page + 1}&limit=${pageSize}`;
        const res = await API.get(apiUrl);

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
            setData(res.data);
            setRowCount(res.data.length); 
        }
      } catch (err) {
        setError(err);
        console.error("Error fetching admin data:", err);
        console.log(data)
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [path, page, pageSize]);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setOpenModal(true);
  };


const handleRoomDelete = async (id) => {
  const { isConfirmed } = await Swal.fire({
    title: 'Are you sure?',
    text: "You are about to delete this room. This action cannot be undone!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  });

  if (!isConfirmed) return;

  try {
    const response = await API.get(`/rooms/${id}/hotel`);
    const hotelId = response.data.hotelId;

    await API.delete(`/rooms/${id}/${hotelId}`);

    setData((prev) => prev.filter((item) => item._id !== id));
    setRowCount((prev) => prev - 1);

    Swal.fire('Deleted!', 'The room has been deleted.', 'success');

  } catch (err) {
    const errorMsg = err.response?.data?.message || "Something went wrong!";
    Swal.fire('Failed!', errorMsg, 'error');
    console.error("Delete failed:", err);
  }
};



  const handleDelete = async (id) => {
  const { isConfirmed } = await Swal.fire({
    title: 'Confirm Deletion',
    text: `Are you sure you want to delete this ${path.slice(0, -1)}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Confirm'
  });

  if (!isConfirmed) return;

  try {
    await API.delete(`/${path}/${id}`);
    
    setData(data.filter((item) => item._id !== id)); 
    setRowCount((prev) => prev - 1); 

    Swal.fire('Success!', 'The item has been removed.', 'success');

  } catch (err) {
    const errorMsg = err.response?.data?.message || "Deletion failed. It might have active bookings.";
    Swal.fire('Error', errorMsg, 'error');
    console.error("Error deleting item:", err);
  }
};
  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 250,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/${path}/${params.row._id}`} style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
            
            <div className="editButton" onClick={() => handleEdit(params.row)}>
              Edit
            </div>

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


  const combinedColumns = columns.concat(actionColumn);

  return (
    <div className="datatable">
      <div className="datatableTitle">
        {listType === "hotels" ? "Hotels" : listType === "rooms" ? "Rooms" : listType === "users" ? "Users" : "List"}
        <Link to={`/${path}/new`} className="link">
          Add New {listType === "hotels" ? "Hotel" : listType === "rooms" ? "Room" : listType === "users" ? "User" : "Item"}
        </Link>
      </div>
      {error ? (
        <p>Error loading data: {error.message}</p> 
      ) : (
        <DataGrid
          className="datagrid"
          rows={data} 
          columns={combinedColumns}
          pageSize={pageSize}
          rowCount={rowCount} 
          paginationMode="server" 
          onPageChange={(newPage) => setPage(newPage)} 
          onPageSizeChange={(newSize) => setPageSize(newSize)}
          rowsPerPageOptions={[5, 9, 10, 25, 50]} 
          checkboxSelection
          getRowId={(row) => row._id}
          loading={loading} 
          autoHeight 
        />
      )}

      {openModal && (
        <UpdateModal 
          setOpen={setOpenModal} 
          type={path} 
          item={selectedItem} 
          id={selectedItem._id} 
        />
      )}
    </div>
  );
};

export default Datatable;