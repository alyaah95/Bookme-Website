import { useContext, useState } from "react";
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // التحقق من وجود المستخدم قبل بدء أي عملية (Client-side validation)
        if (!user || !user._id) {
            alert('User not found, please login or register first.');
            return;
        }

        try {
            // استخدام api.post مباشرة
            // لا نحتاج لعمل JSON.stringify، أكسيوس يقوم بذلك تلقائياً
            await api.post(`/users/${user._id}/messages`, formData);

            // إذا وصل الكود هنا، فهذا يعني أن الاستجابة كانت ناجحة (Status 200)
            alert('Thank you for your message. We will get back to you shortly.');
            
            // إعادة تعيين الفورم
            setFormData({
                name: '',
                email: '',
                message: ''
            });

        } catch (err) {
            // سحب رسالة الخطأ القادمة من الباك أند (Server-side error message)
            const errorMsg = err.response?.data?.message || 'There was an error sending your message.';
            
            console.error("Message Error:", errorMsg);

            // معالجة خطأ انتهاء الجلسة أو عدم الصلاحية (401 أو 403)
            if (err.response?.status === 401 || err.response?.status === 403) {
                alert('Your session might have expired. Please login again.');
            } else {
                alert(errorMsg);
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