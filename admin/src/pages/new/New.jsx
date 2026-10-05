import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import axios from "axios";
import { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import "./new.scss";
import API from "../../api/axiosInstance";

const New = ({ inputs, title }) => {
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const validate = () => {
    for (let input of inputs) {
      if (!info[input.id]) return `Field "${input.label}" is required.`;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (info.email && !emailRegex.test(info.email)) return "Invalid email format.";

    if (info.password && info.password.length < 6) return "Password must be at least 6 characters.";

    if (info.phone && info.phone.length < 10) return "Please enter a valid phone number.";

    return null;
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      setLoading(false);
      return;
    }

    try {
      let url = "https://i.ibb.co/MBtjqXQ/no-avatar.gif";

      if (file) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "upload");
        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dqfvmwrye/image/upload",
          data
        );
        url = uploadRes.data.url;
      }

      const newUser = { ...info, img: url };

      await API.post("/auth/register", newUser);

      setSuccessMessage("User added successfully!");
      setInfo({});
      setFile(null);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      let msg = "Something went wrong!";
      
      if (err.response?.data?.message?.includes("E11000")) {
        if (err.response.data.message.includes("email")) {
          msg = "This email is already in use. Please try another one.";
        } else if (err.response.data.message.includes("username")) {
          msg = "This username is already taken.";
        } else {
          msg = "This record already exists.";
        }
      } else {
        msg = err.response?.data?.message || "Failed to connect to server.";
      }

      setErrorMessage(msg);
      console.log("Full Error:", err);
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
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={file ? URL.createObjectURL(file) : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"}
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
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    onChange={handleChange}
                    type={input.type}
                    placeholder={input.placeholder}
                    id={input.id}
                    value={info[input.id] || ""}
                    required
                  />
                </div>
              ))}
              <button onClick={handleClick}>Send</button>
            </form>
            <div className="messages">
               {successMessage && <p className="successMessage">{successMessage}</p>}
               {errorMessage && <p className="errorMessage">{errorMessage}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;