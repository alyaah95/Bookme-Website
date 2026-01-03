import React from 'react';
//import { FaStar } from 'react-icons/fa'; // Import star icon from react-icons/fa
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./historyBookings.css";
import api from '../../utils/api';
const HistoryBookings = () => {
    const { user} = useContext(AuthContext);
    const userId = user._id;
    const [currentBookings, setcurrentBookings] = useState([]);
    const [historyBookings, sethistoryBookings] = useState([]);


    const deleteOldDatesFromRoomAvailability = async () => {
      try {

        const res = await api.delete('/rooms/deleteoldAvailability');
        return res.data ; // Assuming the server returns a message upon successful deletion
        
      } catch (error) {
        console.error("Error deleting old dates from room availability:", error.message);
      }
    };
   
  
    useEffect(() => {
        const fetchcurrentBookings = async () => {
            if (!userId) return; // تأمين الكود لو الـ userId لسه مش موجود
            try {
                const response = await api.get(`/users/${userId}/currentBookings`);
                setcurrentBookings(response.data);
            } catch (error) {
                console.error("Error fetching current bookings:", error.response?.data?.message || error.message);
            }
        };
        fetchcurrentBookings();
    }, [userId]);

    // جلب تاريخ الحجوزات
    useEffect(() => {
        const fetchhistoryBookings = async () => {
            if (!userId) return;
            try {
                const response = await api.get(`/users/${userId}/historyBookings`);
                sethistoryBookings(response.data);
            } catch (error) {
                console.error("Error fetching history bookings:", error.response?.data?.message || error.message);
            }
        };
        fetchhistoryBookings();
    }, [userId]);

    function isBookingOld(booking) {
        // التأكد من تحويل التاريخ بشكل سليم
        const toDate = new Date(booking.toDate).getTime();
        const currentDate = new Date().setHours(0, 0, 0, 0); // بداية اليوم الحالي
        
        return toDate < currentDate;
    };

    // إضافة حجز للتاريخ
    const addHistoryBookingCard = async (bookingCard) => {
        try {
            // في الـ POST بنبعت الـ body مباشرة كتاني parameter
            await api.post(`/users/${userId}/historybookings`, { bookingCard });

            // لو العملية نجحت، هنحذف الحجز من الحالي
            await removeCurrentBookingFromUser(bookingCard._id);
            console.log("This booking became old:", bookingCard);
            
        } catch (error) {
            console.error('Error adding booking:', error.response?.data?.message || error.message);
        }
    };

    // حذف حجز من القائمة الحالية
    const removeCurrentBookingFromUser = async (bookingId) => {
        try {
            // في الـ DELETE بنحط الـ body جوه object اسمه data
            const response = await api.delete(`/users/${userId}/currentbookings`, {
                data: { bookingId }
            });

            console.log('Booking removed successfully');
            return response.data;
        } catch (error) {
            console.error('Delete Error:', error.response?.data?.message || error.message);
            throw error;
        }
    };

      
      currentBookings.forEach(async booking => {
        if (isBookingOld(booking)) {
          await addHistoryBookingCard(booking);
          await deleteOldDatesFromRoomAvailability();
        }
      });
      
    

    

      return (
        <div className="history-bookings">
          <h2>History Bookings</h2>
          <ul>
            {historyBookings.map((booking) => (
              <li key={booking._id}>
                <div className="booking-details">
                  <div>
                    <span className="booking-date">
                      <strong>From: </strong>
                      {booking.fromDate}
                    </span>{' '}
                    <strong>,</strong>{' '}
                    <span className="booking-date">
                      <strong>To: </strong>
                      {booking.toDate}
                    </span>
                  </div>
                  <div>
                    <span className="booking-location">City: {booking.city}</span>{' '}
                    <span className="booking-status">Total Cost: ${booking.totalCost}</span>
                  </div>
                  <div>
                    <span className="booking-details">Adults: {booking.numberOfAdults}</span>
                    <span className="booking-details">Children: {booking.numberOfChildren}</span>
                    <span className="booking-details">Rooms: {booking.numberOfRooms}</span>
                  </div>
                  <div>
                    <span className="booking-details">Hotel: {booking.hotelName}</span>
                    <span className="booking-details">
                      Room Names:{' '}
                      {booking.ReservationDetails.map((detail, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <b>, </b>}
                          {detail.selectedRoomsNums.join(', ')} =&gt; {detail.roomtitle}
                        </React.Fragment>
                      ))}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    };

export default HistoryBookings;


