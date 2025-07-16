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

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Check if all fields are filled
    const allFieldsFilled = inputs.every((input) => info[input.id]);
    if (!allFieldsFilled) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (file) {
      data.append("file", file);
      data.append("upload_preset", "upload");

      try {
        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dqfvmwrye/image/upload",
          data
        );

        const { url } = uploadRes.data;

        const newUser = {
          ...info,
          img: url,
        };

        await API.post("/auth/register", newUser);

        // Clear the form and show success message
        setFile(null);
        setInfo({});
        setSuccessMessage("User added successfully!");
        setErrorMessage("");

        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (err) {
        console.log(err);
      }
    } else {
      // If no file is uploaded, use the default image URL
      const newUser = {
        ...info,
        img: "https://i.ibb.co/MBtjqXQ/no-avatar.gif",
      };

      try {
        await API.post("/auth/register", newUser);

        // Clear the form and show success message
        setFile(null);
        setInfo({});
        setSuccessMessage("User added successfully!");
        setErrorMessage("");

        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (err) {
        console.log(err);
      }
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
              src={
                file
                  ? URL.createObjectURL(file)
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
                  />
                </div>
              ))}
              <button onClick={handleClick}>Send</button>
              {successMessage && <p className="successMessage">{successMessage}</p>}
              {errorMessage && <p className="errorMessage">{errorMessage}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;


