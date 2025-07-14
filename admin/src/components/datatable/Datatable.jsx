import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import "./datatable.scss";

const Datatable = ({ columns }) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const [list, setList] = useState([]);
  const { data } = useFetch(`/${path}`);

  useEffect(() => {
    setList(data);
  }, [data]);

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
      await axios.delete(`/${path}/${id}`);
      setList(list.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const userActionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/${path}/${params.row._id}`} style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
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

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
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

  const combinedColumns = path === "users" ? columns.concat(userActionColumn) : columns.concat(actionColumn);

  return (
    <div className="datatable">
      <div className="datatableTitle">
        {path}
        <Link to={`/${path}/new`} className="link">
          Add New
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={list}
        columns={combinedColumns}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        getRowId={(row) => row._id}
      />
    </div>
  );
};

export default Datatable;
