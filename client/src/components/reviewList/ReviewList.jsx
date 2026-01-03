// ReviewList.jsx
import React, { useContext, useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa'; // Import star icon from react-icons/fa
import { Link } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext";
import NewReview from '../../pages/newReview/NewReview.jsx';
import "./reviewList.css";
import api from '../../utils/api.js';

const ReviewList = () => {
  const { user } = useContext(AuthContext);
  const userId = user._id;
  const [userReviews, setUserReviews] = useState([]);
  const [historyBookings, setHistoryBookings] = useState([]);

  useEffect(() => {
    const fetchHistoryBookings = async () => {
      // تأمين الطلب: لو الـ userId مش موجود ميبعتش طلب للسيرفر ويطلع error
      if (!userId) return;

      try {
        // 1. استخدمنا api.get والمسار المختصر فقط
        // 2. مفيش خطوة response.json() لأن Axios بيعملها لوحده
        const response = await api.get(`/users/${userId}/historyBookings`);
        setHistoryBookings(response.data);
      } catch (error) {
        // 3. طريقة احترافية لسحب رسالة الخطأ من الباك أند
        const msg = error.response?.data?.message || "Failed to fetch history bookings";
        console.error("History Bookings Error:", msg);
      }
    };

    fetchHistoryBookings();
  }, [userId]);

  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!userId) return;
      try {
        const response = await api.get(`/reviews/user/${userId}/reviews`);
        setUserReviews(response.data);
      } catch (error) {
        const msg = error.response?.data?.message || "Failed to fetch user reviews";
        console.error("User Reviews Error:", msg);
      }
    };

    fetchUserReviews();
  }, [userId]);

  return (
    <div className="review_list">
      <h2>Reviews</h2>
      <br />
      <ul>
        {userReviews.map(review => (
          <li key={review._id}>
            <div>
              <span>{review.date}</span>{'                                                                              '}
              <div className="rating">
                {[...Array(review.rating)].map((_, index) => (
                  <FaStar key={index} className="star" />
                ))}
              </div>
            </div>
            <p>Hotel: {review.hotelId?.name}</p>
            <p>{review.comment}</p>
            <br />
          </li>
        ))}
      </ul>
      <Link to="/new-review">
        <button
          className="Rbutton"
          onClick={NewReview}
          disabled={historyBookings.length === 0}
        >
          Add Review
        </button>
      </Link>
    </div>
  );
};

export default ReviewList;