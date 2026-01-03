import "./list.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import Datatable from "../../components/datatable/Datatable"
import { useLocation } from "react-router-dom"; // 🚀 Import useLocation to get the path

const List = ({columns}) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1]; // 🚀 Get "hotels", "rooms", or "users"

  // 🚀 Determine the listType based on the path
  let listType;
  if (path === "hotels") {
    listType = "hotels";
  } else if (path === "rooms") {
    listType = "rooms";
  } else if (path === "users") {
    listType = "users";
  } else {
    listType = ""; // Fallback or handle other cases if they exist
  }

  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        {/* 🚀 Pass the determined listType to Datatable */}
        <Datatable columns={columns} listType={listType} /> 
      </div>
    </div>
  )
}

export default List