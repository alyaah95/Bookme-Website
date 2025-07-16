// import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import './messages.scss';
import API from "../../api/axiosInstance";

const Messages = () => {
  const { userId } = useParams(); // Assuming userId is obtained from route params
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserMessages = async () => {
      setLoading(true); // Set loading state to true before fetching data
      try {
        const response = await API.get(`http://localhost:8800/api/users/${userId}/messages`);
        setMessages(response.data);
        setLoading(false); // Set loading state to false after successful data fetch
      } catch (err) {
        setError(err); // Set error state if fetch fails
        setLoading(false); // Set loading state to false on error
      }
    };

    fetchUserMessages();
  }, [userId]);

  if (loading) return <div className="messages-loading">Loading...</div>; // Loading state
  if (error) return <div className="messages-error">Error fetching messages: {error.message}</div>; // Error state

  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <div className="messages-container">
      <h2>User Messages</h2>
      {messages.length > 0 ? (
        <ul className="messages-list">
          {messages.map((message) => (
            <li key={message._id} className="message-item">
              <p><strong>From:</strong> {message.name}</p>
              <p><strong>Email:</strong> {message.email}</p>
              <p><strong>Message:</strong> {message.message}</p>
              <p><strong>Date:</strong> {new Date(message.date).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No messages found for this user.</p>
      )}
    </div>
      </div>
    </div>
    
  );
};

export default Messages;
