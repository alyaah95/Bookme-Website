import axios from "axios";
import api from './../../utils/api';
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./login.css";
import Swal from 'sweetalert2';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });

    const [showForgot, setShowForgot] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const { loading, errorL, dispatch } = useContext(AuthContext);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

   
    const handleClick = async (e) => {
        e.preventDefault();
        if (credentials.username.trim() === "" ) {
            dispatch({ type: "LOGIN_FAILURE", payload: { message: "Username is reqired, make sure you have filled all fields" } });
            return;
          }
        if (credentials.password.trim() === "" ) {
            dispatch({ type: "LOGIN_FAILURE", payload: { message: "password is reqired, make sure you have filled all fields" } });
            return;
          }
        dispatch({ type: "LOGIN_START" });
        try {
            const res = await api.post("/auth/login", credentials);
            // Assuming the login is successful for any user
            dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });
            navigate("/");
        } catch (err) {
            const errorMessage = err.response?.data || { message: "Something went wrong, please try again." };
            dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
        }
    };

    const handleSendOTP = async () => {
        try {
            // ننتظر الرد من السيرفر
            const res = await api.post("/auth/forgot-password", { email });
            
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
            const res = await api.post("/auth/reset-password", { email, otp, newPassword });
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
                <h3>
                    Sign in or create an account
                </h3>
                <input
                    type="text"
                    placeholder="Enter your username"
                    id="username"
                    onChange={handleChange}
                    className="lInput"
                />
                <input
                    type="password"
                    placeholder="Enter your password"
                    id="password"
                    onChange={handleChange}
                    className="lInput"
                />
                <button disabled={loading} onClick={handleClick} className="lButton">
                    Login
                </button>
                {/* رابط نسيت كلمة المرور */}
                <span className="forgotLink" onClick={() => setShowForgot(true)}>
                    Forgot Password?
                </span>
                <button disabled={loading} onClick={() => navigate("/register")} className="lButton">
                    Sign Up
                </button>
                {errorL && <span className="error-message">{errorL.message}</span>}
            </div>
            {/* Modal "نسيت كلمة المرور" */}
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