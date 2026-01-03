import "./updateModal.scss";
import { useState } from "react";
import API from "../../api/axiosInstance";
import Swal from 'sweetalert2';

const UpdateModal = ({ setOpen, type, item, id }) => {
  const [info, setInfo] = useState({});

  // منطق التحقق من وجود حجز لتعطيل الحقول في الفرونت أند (اختياري لزيادة الأمان)
  const hasBookings = type === "rooms" 
    ? item.roomNumbers?.some(rn => rn.unavailableDates.length > 0)
    : type === "hotels"
      ? item.rooms?.some(r => r.roomNumbers?.some(rn => rn.unavailableDates.length > 0))
      : false;

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/${type}/${id}`, info);
      await Swal.fire("Success!", "Information updated successfully", "success");
      setOpen(false);
      window.location.reload();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update", "error");
    }
  };

  return (
    <div className="updateModal">
      <div className="uContainer">
        <span className="close" onClick={() => setOpen(false)}>X</span>
        <h1>Update {type.slice(0, -1)}</h1>
        <form className="updateForm">
          
          {/* --- حقول الفندق (Hotel) --- */}
          {type === "hotels" && (
            <div className="formGrid">
              <div className="item">
                <label>Name</label>
                <input id="name" type="text" defaultValue={item.name} onChange={handleChange} />
              </div>
              <div className="item">
                <label>Type</label>
                <input id="type" type="text" defaultValue={item.type} onChange={handleChange} />
              </div>
              <div className="item">
                <label>City</label>
                <input id="city" type="text" defaultValue={item.city} onChange={handleChange} disabled={hasBookings} />
              </div>
              <div className="item">
                <label>Address</label>
                <input id="address" type="text" defaultValue={item.address} onChange={handleChange} disabled={hasBookings} />
              </div>
              <div className="item">
                <label>Distance</label>
                <input id="distance" type="text" defaultValue={item.distance} onChange={handleChange} />
              </div>
              <div className="item">
                <label>Title</label>
                <input id="title" type="text" defaultValue={item.title} onChange={handleChange} />
              </div>
              <div className="item">
                <label>Cheapest Price</label>
                <input id="cheapestPrice" type="number" defaultValue={item.cheapestPrice} onChange={handleChange} disabled={hasBookings} />
              </div>
              <div className="item full">
                <label>Description</label>
                <textarea id="desc" defaultValue={item.desc} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* --- حقول الغرفة (Room) --- */}
          {type === "rooms" && (
            <div className="formGrid">
              <div className="item">
                <label>Room Title</label>
                <input id="title" type="text" defaultValue={item.title} onChange={handleChange} />
              </div>
              <div className="item">
                <label>Price</label>
                <input id="price" type="number" defaultValue={item.price} onChange={handleChange} disabled={hasBookings} />
              </div>
              <div className="item">
                <label>Max People</label>
                <input id="maxPeople" type="number" defaultValue={item.maxPeople} onChange={handleChange} disabled={hasBookings} />
              </div>
              <div className="item full">
                <label>Description</label>
                <textarea id="desc" defaultValue={item.desc} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* --- حقول المستخدم (User) --- */}
          {type === "users" && (
            <div className="formGrid">
              <div className="item">
                <label>Username (Locked)</label>
                <input id="username" type="text" defaultValue={item.username} disabled />
              </div>
              <div className="item">
                <label>Email (Locked)</label>
                <input id="email" type="email" defaultValue={item.email} disabled />
              </div>
              <div className="item">
                <label>Country</label>
                <input id="country" type="text" defaultValue={item.country} onChange={handleChange} />
              </div>
              <div className="item">
                <label>City</label>
                <input id="city" type="text" defaultValue={item.city} onChange={handleChange} />
              </div>
              <div className="item">
                <label>Phone</label>
                <input id="phone" type="text" defaultValue={item.phone} onChange={handleChange} />
              </div>
            </div>
          )}

          <button className="updateBtn" onClick={handleUpdate}>Save Changes</button>
          {hasBookings && <p className="warningMsg">⚠️ Some fields are locked due to active bookings.</p>}
        </form>
      </div>
    </div>
  );
};

export default UpdateModal;