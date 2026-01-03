import React, { useContext, useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import { AuthContext } from "../../context/AuthContext";
import './newReview.css';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const NewReview = () => {
  const { user } = useContext(AuthContext);
  const userId = user._id;
  const [historyBookings, setHistoryBookings] = useState([]);
  const [review, setReview] = useState({
    hotelId: '',
    hotelName: '',
    rating: 0,
    comment: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistoryBookings = async () => {
      // حماية: لو الـ userId لسه مش موجود ميعملش طلب
      if (!userId) return;

      try {
        const response = await api.get(`/users/${userId}/historyBookings`);
        // Axios بيحط البيانات في response.data تلقائياً
        setHistoryBookings(response.data);
      } catch (error) {
        console.error("Error fetching history bookings:", error.response?.data?.message || error.message);
      }
    };

    fetchHistoryBookings();
  }, [userId]);

  // Extract unique hotel names
  const uniqueHotelNames = Array.from(new Set(historyBookings.map(booking => booking.hotelName)));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReview(prevReview => ({
      ...prevReview,
      [name]: value
    }));
  };

  const updateUserReviews = async (review) => {
    try {
      // 1. مفيش داعي للـ Basic Auth ولا الـ Headers اليدوية
      // 2. الـ api instance هيبعت الكوكيز تلقائياً
      await api.post(`/users/${user._id}/reviews`, { 
        userid: user._id, 
        reviewContent: review 
      });

      console.log("Review updated successfully");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to update user reviews";
      console.error('Error updating user reviews:', errorMsg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. العثور على الفندق المختار من المصفوفة
    const selectedBooking = historyBookings.find(b => b.hotelName === review.hotelName);
    console.log("Selected Hotel from Booking History:",typeof( selectedBooking.ReservationDetails[0].hotelId));
    
    if (!selectedBooking) {
      alert("Please select a hotel first");
      return;
    }

    // 2. التصحيح هنا: الـ hotelId موجود مباشرة في selectedBooking
    // تأكدي من كتابتها hotelId كما تظهر في الـ console عندك
    const hotelId = selectedBooking.ReservationDetails[0].hotelId; 

    // تأكيد إضافي عشان الطلب ميبوظش لو الـ ID مش موجود
    if (!hotelId || hotelId === "undefined") {
      console.error("Hotel ID is missing in the selected booking!", selectedBooking);
      alert("Error: Hotel ID not found in booking history");
      return;
    }

    try {
      // 3. إرسال الطلب بالـ ID الصحيح
      await api.post(`/reviews/${hotelId}/reviews`, {
        rating: review.rating,
        comment: review.comment,
        // userId السيرفر بيجيبه من التوكن خلاص
      });

      Swal.fire("Success", "Review added!", "success");
      navigate('/profile');
    } catch (error) {
      console.error("Submission Error:", error.response?.data);
      // لو لسه بيحولك للوجن، عطل السطر اللي تحت
      // navigate('/login'); 
    }
  };
  return (
    <div>
      <Navbar />
      <div className="new-review-container">
        <h2>Add a New Review</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="hotelName">Hotel Name:</label>
          <select id="hotelName" name="hotelName" value={review.hotelName} onChange={handleChange}>
            <option value="">Select Hotel</option>
            {uniqueHotelNames.map((hotel, index) => (
              <option key={index} value={hotel}>{hotel}</option>
            ))}
          </select>

          <label htmlFor="rating">Rating:</label>
          <div className="rating">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={index < review.rating ? "star selected" : "star"}
                onClick={() => handleChange({ target: { name: "rating", value: index + 1 } })}
              />
            ))}
          </div>

          <label htmlFor="comment">Comment:</label>
          <textarea id="comment" name="comment" value={review.comment} onChange={handleChange} maxLength={300} />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default NewReview;
