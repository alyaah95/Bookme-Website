import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import "./currentBookings.css";
import api from '../../utils/api';

const CurrentBookings = () => {
    const { user } = useContext(AuthContext);
    const userId = user._id;
    const [currentBookings, setCurrentBookings] = useState([]);
    const [showAlert, setShowAlert] = useState(false); // State to control alert visibility

    const getDatesInRange = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const date = new Date(start.getTime());
        const dates = [];

        while (date <= end) {
            dates.push(new Date(date).toDateString());
            date.setDate(date.getDate() + 1);
        }

        return dates;
    };

    const removeCurrentBookingFromUser = async (bookingId) => {
        try {
            // نرسل فقط المسار المتغير، الـ Base URL هيضاف تلقائياً
            const response = await api.delete(`/users/${userId}/currentbookings`, {
                data: { bookingId: bookingId } 
            });

            // Axios يعيد البيانات جاهزة في response.data ولا نحتاج response.json()
            return response.data;
        } catch (error) {
            // التعامل مع الخطأ بشكل احترافي
            const message = error.response?.data?.message || 'Failed to remove booking';
            console.error("Delete Booking Error:", message);
            throw new Error(message);
        }
    };

    const deleteDatesFromRooms = async (roomDetails, dates) => {
        try {
            const response = await api.delete('/rooms/deletecanceledAvailability', {
                data: { roomDetails, dates }
            });

            console.log(response.data); // Output: 'Selected dates have been deleted...'
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete dates from rooms';
            console.error('Error deleting dates:', message);
            throw new Error(message);
        }
    };

    const handleDeleteBooking = async (booking) => {
        await removeCurrentBookingFromUser(booking._id);
        const dates = getDatesInRange(booking.fromDate, booking.toDate);
        deleteDatesFromRooms(
            booking.ReservationDetails.map((room) => ({ roomid: room.roomid, selectedRoomsId: room.selectedRoomsId })),
            dates
        );

        setCurrentBookings((prevBookings) => prevBookings.filter((prevBooking) => prevBooking._id !== booking._id));
        setShowAlert(true); // Show alert after booking cancellation
        setTimeout(() => setShowAlert(false), 2000); // Hide alert after 2 seconds
    };

    useEffect(() => {
        // يفضل دائماً تعريف الدالة داخل الـ useEffect لو مش هتستخدميها بره
        const fetchcurrentBookings = async () => {
            try {
                // باستخدام axios instance (api)
                const response = await api.get(`/users/${userId}/currentBookings`);
                
                // Axios بيعمل JSON.parse تلقائياً، الداتا موجودة في response.data
                setCurrentBookings(response.data);
            } catch (error) {
                // سحب رسالة الخطأ من السيرفر لو موجودة، وإلا عرض رسالة افتراضية
                const errorMsg = error.response?.data?.message || 'Failed to fetch current bookings';
                console.error('Error fetching current bookings:', errorMsg);
            }
        };

        if (userId) {
            fetchcurrentBookings();
        }
    }, [userId]);

    return (
        <div className="current-bookings">
            <h2>Current Bookings</h2>
            {showAlert && <div className="alert">Your reservation has been canceled</div>}
            <ul>
                {currentBookings.map((booking) => (
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
                                            {index > 0 && <b className="bold">, </b>}
                                            {detail.selectedRoomsNums.join(', ')} =&gt; {detail.roomtitle}
                                        </React.Fragment>
                                    ))}
                                </span>
                                <br />
                                <span>
                                    <button className='CRbutton' onClick={() => handleDeleteBooking(booking)}>Cancel Reservation</button>
                                </span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CurrentBookings;
