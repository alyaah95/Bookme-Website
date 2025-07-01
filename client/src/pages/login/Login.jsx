import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
// import { AuthContext } from "../../context/AuthContext";
import "./login.css";

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });

    const { loading, errorL, dispatch } = useContext(AuthContext);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    // const handleClick = async (e) => {
    //     e.preventDefault();
    //     dispatch({ type: "LOGIN_START" });
    //     try {
    //         const res = await axios.post("/auth/login", credentials);
    //         if (res.data.isAdmin) {
    //             dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });

    //             navigate("/");
    //         } else {
    //             dispatch({
    //                 type: "LOGIN_FAILURE",
    //                 payload: { message: "You are not allowed!" },
    //             });
    //         }
    //     } catch (err) {
    //         dispatch({ type: "LOGIN_FAILURE", payload: err.response.data });
    //     }
    // };
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
            const res = await axios.post("/auth/login", credentials);
            // Assuming the login is successful for any user
            dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });
            navigate("/");
        } catch (err) {
            dispatch({ type: "LOGIN_FAILURE", payload: err.response.data });
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
                <button disabled={loading} onClick={() => navigate("/register")} className="lButton">
                    Sign Up
                </button>
                {errorL && <span className="error-message">{errorL.message}</span>}
            </div>
        </div>

    );
};

export default Login;