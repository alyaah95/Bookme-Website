import "./list.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import Datatable from "../../components/datatable/Datatable"
import { useLocation } from "react-router-dom"; 

const List = ({columns}) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1]; 

  let listType;
  if (path === "hotels") {
    listType = "hotels";
  } else if (path === "rooms") {
    listType = "rooms";
  } else if (path === "users") {
    listType = "users";
  } else {
    listType = "";
  }

  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <Datatable columns={columns} listType={listType} /> 
      </div>
    </div>
  )
}

export default List