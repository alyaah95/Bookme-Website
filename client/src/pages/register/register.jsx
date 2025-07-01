import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./register.css";

const Register = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    email: "",
    password: "",
    repassword: "",
    country:"",
    city:"",
    phone:"",
  });

  const { loading, errorR, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    // Check if passwords match
    
    if (credentials.username.trim() === "" ) {
      dispatch({ type: "REGISTER_FAILURE", payload: { message: "Username is reqired, make sure you have filled all fields" } });
      return;
    }
    if (credentials.email.trim() === "" ) {
      dispatch({ type: "REGISTER_FAILURE", payload: { message: "email is reqired, make sure you have filled all fields" } });
      return;
    }
    if (credentials.password.trim() === "" ) {
      dispatch({ type: "REGISTER_FAILURE", payload: { message: "password is reqired, make sure you have filled all fields" } });
      return;
    }
    if (credentials.repassword.trim() === "" ) {
      dispatch({ type: "REGISTER_FAILURE", payload: { message: "you have to repeat password, make sure you have filled all fields" } });
      return;
    }
    if (credentials.country.trim() === "" ) {
      dispatch({ type: "REGISTER_FAILURE", payload: { message: "country is reqired, make sure you have filled all fields" } });
      return;
    }
    if (credentials.city.trim() === "" ) {
      dispatch({ type: "REGISTER_FAILURE", payload: { message: "city is reqired, make sure you have filled all fields" } });
      return;
    }
    if (credentials.phone.trim() === "" ) {
      dispatch({ type: "REGISTER_FAILURE", payload: { message: "phone is reqired, make sure you have filled all fields" } });
      return;
    }
    if (credentials.password !== credentials.repassword) {
      dispatch({ type: "REGISTER_FAILURE", payload: { message: "Passwords do not match" } });
      return;
    }

    dispatch({ type: "REGISTER_START" });
    try {
      const res = await axios.post("/auth/register", credentials);
      dispatch({ type: "REGISTER_SUCCESS", payload: res.data.details });
      // Redirect to login page after successful registration
      navigate("/login");
    } catch (err) {
      const searchUsername = ["duplicate key","username"]
      const findUsername = searchUsername.every(subString => err.response.data.message.includes(subString))
      const searchEmail = ["duplicate key","email"]
      const findEmail = searchEmail.every(subString => err.response.data.message.includes(subString))
      
      if (findUsername) {
        dispatch({ type: "REGISTER_FAILURE", payload: {message: "Username already exists"} });
      }
      else if (findEmail){
        dispatch({ type: "REGISTER_FAILURE", payload: {message: "Email already exists"} });
      }
      
      console.log(err.response.data.message);
      
    }
  };

  return (
    <div className="register">
      
      <div className="rContainer">
        <input
          type="text"
          placeholder="Username"
          id="username"
          onChange={handleChange}
          className="rInput"
        />
        <input
          type="email"
          placeholder="Email"
          id="email"
          onChange={handleChange}
          className="rInput"
        />
        <input
          type="text"
          placeholder="country"
          id="country"
          onChange={handleChange}
          className="rInput"
        />
        <input
          type="text"
          placeholder="city"
          id="city"
          onChange={handleChange}
          className="rInput"
        />
        <input
          type="text"
          placeholder="phone"
          id="phone"
          onChange={handleChange}
          className="rInput"
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          onChange={handleChange}
          className="rInput"
        />
        <input
          type="password"
          placeholder="Repeat Password"
          id="repassword"
          onChange={handleChange}
          className="rInput"
        />



        {/* Add other necessary input fields for registration */}
        <button disabled={loading} onClick={handleClick} className="rButton">
          Register
        </button>
        {errorR && <span className="error-message">{errorR.message}</span>}
      </div>
    </div>
  );
};

export default Register;
