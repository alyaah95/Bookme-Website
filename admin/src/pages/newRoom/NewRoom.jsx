import axios from "axios";
import { useEffect, useState } from "react"; // Import useEffect
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import { roomInputs } from "../../formSource";
import useFetch from "../../hooks/useFetch";
import "./newRoom.scss";
import API from "../../api/axiosInstance";

const NewRoom = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [info, setInfo] = useState({});
  const [hotelId, setHotelId] = useState(""); // Initialize with an empty string
  const [rooms, setRooms] = useState("");
  const { data, loading } = useFetch("/hotels");
  const [loadingRequest, setLoadingRequest] = useState(false);

  useEffect(() => {
    // Reset hotelId state whenever the data changes (once data is loaded)
    if (!loading && data.length > 0) {
      setHotelId(""); // Reset to empty string to ensure no pre-selection
    }
  }, [data, loading]);

  const handleChange = (e) => {
    setInfo((prevInfo) => ({
      ...prevInfo,
      [e.target.id]: e.target.value,
    }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setLoadingRequest(true);
    setErrorMessage("");
    setSuccessMessage("");

    // 1. التأكد من حقول الـ Inputs (مثل السعر والوصف)
    const isInfoIncomplete = roomInputs.some((input) => !info[input.id]);
    
    // 2. فحص شامل ومنفصل (الصح)
    if (isInfoIncomplete || !hotelId || !rooms.trim()) {
      setErrorMessage("Please fill in all the fields correctly.");
      setLoadingRequest(false);
      return;
    }
    if (isNaN(info.price)) {
      setErrorMessage("Price must be a number!");
      setLoadingRequest(false);
      return;
    }

    // 3. تحويل النص لمصفوفة أرقام غرف مع تنظيف المسافات
    // لو الأدمن كتب "101, 102 " الـ trim هيشيل الفراغات
    const roomNumbers = rooms.split(",").map((room) => ({ number: room.trim() }));

    try {
      setLoadingRequest(true); // ابدأ الـ loading
      await API.post(`/rooms/${hotelId}`, { ...info, roomNumbers });
      
      setSuccessMessage("Room added successfully!");
      setInfo({});
      setHotelId("");
      setRooms("");
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to create room.");
    } finally {
      setLoadingRequest(false); // وقف الـ loading
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Add New Room</h1>
        </div>
        <div className="bottom">
          <div className="right">
            <form>
              {roomInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    type={input.type}
                    placeholder={input.placeholder}
                    value={info[input.id] || ""}
                    onChange={handleChange}
                  />
                </div>
              ))}
              <div className="formInput">
                <label>Rooms</label>
                <textarea
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  placeholder="Give comma between room numbers."
                />
              </div>
              <div className="formInput">
                <label>Choose a hotel</label>
                <select
                  id="hotelId"
                  value={hotelId} // Ensure value is controlled by state
                  onChange={(e) => setHotelId(e.target.value)}
                >
                  <option value="">Choose a hotel</option> {/* Default option */}
                  {loading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    data &&
                    data.map((hotel) => (
                      <option key={hotel._id} value={hotel._id}>
                        {hotel.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <button onClick={handleClick}>Send</button>
            </form>
            {errorMessage && (
              <p className="errorMessage">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="successMessage">{successMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRoom;
