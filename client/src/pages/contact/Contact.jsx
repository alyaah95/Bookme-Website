import { useContext, useState } from "react";
import Footer from '../../components/footer/Footer';
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Navbar from "../../components/navbar/Navbar";
import { AuthContext } from "../../context/AuthContext";
import './contact.css'; // Importing CSS for styling

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const { user, loading, error } = useContext(AuthContext);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8800/api/users/${user._id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            alert('Thank you for your message. We will get back to you shortly.');
            setFormData({
                name: '',
                email: '',
                message: ''
            });
        } catch (err) {
            console.error(err.message);
            if (err.message.includes('Cannot read properties of null')){
                alert('User not found, please login or register first.')
            }
            else{
                alert('There was an error sending your message. Please try again later.');
            }
            
        }
    };

    return (
      <div>
        <Navbar />
        <Header type={"list"} />
        <form className="contact-form" onSubmit={handleSubmit}>
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
            {error && <span>{error.message}</span>}
        </form>
        <div className="End_Page">
          <MailList />
          <Footer />
        </div>
      </div>
    );
};

export default Contact;