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
    // Validate that all required fields are filled
    const requiredFields = [...roomInputs.map((input) => input.id), "hotelId", "rooms"];
    const emptyFields = requiredFields.filter((field) => !info[field] && !hotelId && !rooms);

    if (emptyFields.length > 0) {
      setErrorMessage("Please fill in all the fields.");
      return;
    }

    const roomNumbers = rooms.split(",").map((room) => ({ number: room }));
    try {
      await API.post(`/rooms/${hotelId}`, { ...info, roomNumbers, hotelId });
      // Clear the form and show success message
      setInfo({}); // Reset the info state
      setHotelId("");
      setRooms("");
      setSuccessMessage("Room added successfully!");
      setErrorMessage(""); // Clear error message

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.log(err);
      setErrorMessage("Please fill in all the fields.");
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
