import { useContext, useState , useEffect, useRef } from "react";
import Footer from '../../components/footer/Footer';
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Navbar from "../../components/navbar/Navbar";
import { AuthContext } from "../../context/AuthContext";
import './contact.css'; // Importing CSS for styling
import api from "../../utils/api";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const { user, loading, error } = useContext(AuthContext);
    const [localError, setLocalError] = useState(null); 
    const errorRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        if (localError) {
            errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [localError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) {
            setLocalError({ message: 'Please enter your name.' });
            return;
        }

        if (!formData.email.trim()) {
        setLocalError({ message: 'Please enter your email address.' });
            return;
        } else if (!emailRegex.test(formData.email)) {
            setLocalError({ message: 'Please enter a valid email address (e.g., name@example.com).' });
            return;
        }

        if (!formData.message.trim()) {
            setLocalError({ message: 'Please type a message before sending.' });
            return;
        }

        if (!user || !user._id) {
            setLocalError({ message: 'User session not found, please login or register first.' });
            return;
        }

        try {

            await api.post(`/users/${user._id}/messages`, formData);

            alert('Thank you for your message. We will get back to you shortly.');
            
            setFormData({
                name: '',
                email: '',
                message: ''
            });

        } catch (err) {
            const errorMsg = err.response?.data?.message || 'There was an error sending your message.';
            
            
            console.error("Message Error:", errorMsg);

            if (err.response?.status === 401 || err.response?.status === 403) {
                setLocalError({ message: 'Your session has expired. Please login again.' });
            } else {
                setLocalError({ message: errorMsg });
            }
        }
    };

    return (
      <div>
        <Navbar />
        <Header type={"list"} />
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <h2>Contact Us</h2>
            <label htmlFor="name">Name</label>
            <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
            />
            <label htmlFor="email">Email</label>
            <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
            />
            <label htmlFor="message">Message</label>
            <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
            ></textarea>
            <button disabled={loading} className="3Button">Send</button>
            {localError && (
                <span ref={errorRef} className="error-message">
                    {localError.message}
                </span>
            )}
        </form>
        <div className="End_Page">
          <MailList />
          <Footer />
        </div>
      </div>
    );
};

export default Contact;