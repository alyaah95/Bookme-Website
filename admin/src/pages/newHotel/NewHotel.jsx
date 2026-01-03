import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import axios from "axios";
import { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import { hotelInputs } from "../../formSource";
import "./newHotel.scss";
import API from "../../api/axiosInstance";

const NewHotel = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [files, setFiles] = useState("");
  const [info, setInfo] = useState({});
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // 1. التأكد من الصور (على الأقل صورة واحدة)
    if (!files || files.length === 0) {
      setErrorMessage("Please upload at least one image.");
      setLoading(false);
      return;
    }

    // 2. التأكد من كل الحقول
    const requiredFields = hotelInputs.map((input) => input.id);
    const isAnyFieldEmpty = requiredFields.some((field) => !info[field]);

    if (isAnyFieldEmpty) {
      setErrorMessage("All text fields are required.");
      setLoading(false);
      return;
    }

    // 3. التأكد إن السعر رقم موجب
    if (info.cheapestPrice && isNaN(info.cheapestPrice) || info.cheapestPrice <= 0) {
      setErrorMessage("Price must be a valid positive number.");
      setLoading(false);
      return;
    }

    try {
      // رفع الصور (الكود بتاعك ممتاز هنا)
      const list = await Promise.all(
        Object.values(files).map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", "upload");
          const uploadRes = await axios.post(
            "https://api.cloudinary.com/v1_1/dqfvmwrye/image/upload",
            data
          );
          return uploadRes.data.url;
        })
      );

      const newhotel = {
        ...info,
        rooms,
        photos: list,
        // تحويل السعر لرقم لضمان عدم حدوث مشاكل في البحث
        cheapestPrice: Number(info.cheapestPrice), 
      };

      await API.post("/hotels", newhotel);
      setSuccessMessage("Hotel added successfully!");
      
      // تنظيف الفورم
      setInfo({});
      setFiles("");
      setRooms([]);
      setSuccessMessage("Hotel added successfully!");
      setErrorMessage(""); // Clear error message

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Clear input values manually
      document.getElementById("file").value = "";
      hotelInputs.forEach((input) => {
        document.getElementById(input.id).value = "";
      });
      document.getElementById("rooms").selectedIndex = -1;
    } catch (err) {
      console.log(err);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Add New Hotel</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                files
                  ? URL.createObjectURL(files[0])
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt=""
            />
          </div>
          <div className="right">
            <form>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  style={{ display: "none" }}
                />
              </div>

              {hotelInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    onChange={handleChange}
                    type={input.type}
                    placeholder={input.placeholder}
                  />
                </div>
              ))}
              <button 
                disabled={loading} 
                onClick={handleClick} 
                style={{ cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Uploading... Please wait" : "Send"}
              </button>
            </form>
            {errorMessage && <p className="errorMessage">{errorMessage}</p>}
            {successMessage && <p className="successMessage">{successMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHotel;
