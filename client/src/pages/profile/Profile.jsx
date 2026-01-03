import { useContext, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import CurrentBookings from '../../components/currentBookings/CurrentBookings.jsx';
import HistoryBookings from '../../components/historyBookings/HistoryBookings.jsx';
import ReviewList from "../../components/reviewList/ReviewList";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";
import axios from "axios";
import Swal from "sweetalert2";
import './profile.css';

const Profile = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [info, setInfo] = useState({});

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // رفع الصورة (كما هو في كودك مع تحديث بسيط للـ Context)
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "upload");

    try {
      const res = await axios.post("https://api.cloudinary.com/v1_1/dqfvmwrye/image/upload", formData);
      const imageUrl = res.data.secure_url;
      await api.put(`/users/${user._id}`, { img: imageUrl });
      
      const updatedUser = { ...user, img: imageUrl };
      dispatch({ type: "LOGIN_SUCCESS", payload: updatedUser });
      localStorage.setItem("user", JSON.stringify(updatedUser));
      Swal.fire("Success", "Profile image updated", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to upload image", "error");
    }
  };

  // تحديث البيانات والباسوورد
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/users/${user._id}`, info);
      
      // تحديث الـ Context والـ LocalStorage
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
      localStorage.setItem("user", JSON.stringify(res.data));
      
      setEditMode(false);
      setInfo({}); // تفريغ البيانات المؤقتة
      Swal.fire("Updated!", "Your information has been updated.", "success");
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Update failed", "error");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="profile">
        <div className="profile-header">
          <label htmlFor="image-upload" className="profile-picture-container">
            <img 
              src={user.img || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"} 
              alt="avatar" 
              className="profile-picture" 
            />
            <div className="upload-overlay">Update Photo</div>
            <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
          </label>
          <h1 className="profile-name">{user.username}</h1>
          <p className="profile-email">{user.email}</p>
          
          <button className="edit-btn" onClick={() => setEditMode(!editMode)}>
            {editMode ? "Cancel Editing" : "Edit Personal Info"}
          </button>
        </div>

        {/* --- وضع التعديل --- */}
        {editMode && (
          <div className="edit-section">
            <h3>Update Your Information</h3>
            <div className="edit-grid">
              <div className="input-group">
                <label>Phone Number</label>
                <input id="phone" type="text" defaultValue={user.phone} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Country</label>
                <input id="country" type="text" defaultValue={user.country} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>City</label>
                <input id="city" type="text" defaultValue={user.city} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>New Password (Leave blank to keep current)</label>
                <input id="password" type="password" placeholder="********" onChange={handleChange} />
              </div>
            </div>
            <button className="save-btn" onClick={handleUpdate}>Save Changes</button>
          </div>
        )}

        <div className="profile-content">
          <CurrentBookings />
          <HistoryBookings />
          <ReviewList />
        </div>
      </div>
      <div className="End_Page">
        <MailList />
        <Footer />
      </div>
    </div>
  );
};

export default Profile;