// import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
// import { AuthContext } from "../../context/AuthContext";
import "./login.scss";
import API from "../../api/axiosInstance";
import Swal from 'sweetalert2';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: undefined,
    password: undefined,
  });

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { loading, error, dispatch } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await API.post("/auth/login", credentials);
      if (res.data.isAdmin) {
        dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });

        navigate("/");
      } else {
        dispatch({
          type: "LOGIN_FAILURE",
          payload: { message: "You are not allowed!" },
        });
      }
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: err.response.data });
    }
  };

  const handleSendOTP = async () => {
        try {
            // ننتظر الرد من السيرفر
            const res = await API.post("/auth/forgot-password", { email });
            
            // لو الرد نجح (Status 200)
            if (res.status === 200) {
                setForgotStep(2); // انقل للخطوة التانية
                Swal.fire("Success", "OTP sent to your email!", "success");
            }
        } catch (err) {
            // لو الإيميل وهمي أو مش موجود، الكود هيدخل هنا
            const errMsg = err.response?.data?.message || "Something went wrong!";
            Swal.fire("Error", errMsg, "error");
            // هنا مش بنغير الـ step فالمستخدم هيفضل في مكانه
        }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword) {
            return Swal.fire("Error", "All fields are required!", "error");
        }
        try {
            const res = await API.post("/auth/reset-password", { email, otp, newPassword });
            if (res.status === 200) {
                Swal.fire("Success", "Password updated successfully!", "success");
                setShowForgot(false); // اقفل المودال تماماً
                setForgotStep(1);     // رجع الخطوات للأول عشان لو فتح تاني
                setOtp("");           // صفر الداتا
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || "Invalid OTP or expired";
            Swal.fire("Error", errMsg, "error");
        }
    };


  return (
    <div className="login">
      <div className="lContainer">
        <input
          type="text"
          placeholder="username"
          id="username"
          onChange={handleChange}
          className="lInput"
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          onChange={handleChange}
          className="lInput"
        />
        <button disabled={loading} onClick={handleClick} className="lButton">
          Login
        </button>
        <span className="forgotLink" onClick={() => setShowForgot(true)}>
            Forgot Password?
        </span>
        {error && <span>{error.message}</span>}
      </div>

      {showForgot && (
          <div className="modalOverlay">
              <div className="modalContent">
                  <h2>Reset Password</h2>
                  
                  {/* خطوة 1: طلب الكود */}
                  {forgotStep === 1 && (
                      <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                          <p>Enter your email to receive a code</p>
                          <input type="email" placeholder="Email" className="lInput" 
                                onChange={(e) => setEmail(e.target.value)} />
                          <button className="lButton" onClick={handleSendOTP}>Send Code</button>
                          <button className="closeBtn" onClick={() => setShowForgot(false)}>Cancel</button>
                      </div>
                  )}

                  {/* خطوة 2: إدخال الكود والباسوورد - مش هتظهر إلا لو نجحت خطوة 1 */}
                  {forgotStep === 2 && (
                      <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                          <p>Enter the code sent to <b>{email}</b></p>
                          <input type="text" placeholder="OTP Code" className="lInput" 
                                onChange={(e) => setOtp(e.target.value)} />
                          <input type="password" placeholder="New Password" className="lInput" 
                                onChange={(e) => setNewPassword(e.target.value)} />
                          <button className="lButton" onClick={handleResetPassword}>Update Password</button>
                          <button className="closeBtn" onClick={() => setForgotStep(1)}>Back</button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Login;
