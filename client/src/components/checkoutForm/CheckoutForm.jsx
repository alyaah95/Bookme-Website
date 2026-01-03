import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api.js";
//import auth context to get user info
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.js";

const CheckoutForm = ({ bookingAmount, bookingDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/hotels/payment", { amount: bookingAmount });
      const { clientSecret } = res.data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.paymentIntent.status === "succeeded") {
        
        // --- المنطق الجديد يبدأ هنا ---
        
        // 1. تحديث إتاحة الغرف (قفل التواريخ)
        await Promise.all(
          bookingDetails.selectedRooms.map((roomId) => {
            return api.put(`/rooms/availability/${roomId}`, {
              dates: bookingDetails.alldates,
            });
          })
        );

        // 2. إضافة كارت الحجز لبروفايل اليوزر
        await api.post(`/users/${user._id}/currentbookings`, {
          bookingCard: bookingDetails, 
          userId: user._id
        });

        alert("Payment Successful & Room Booked!");
        navigate("/profile"); 
      }
    } catch (err) {
        console.error("Full Error Details:", err); // ده هيقولك المشكلة من السيرفر ولا من الكود
        setError(err.response?.data?.message || "Payment failed or database update error");
    }
    setLoading(false);
  };

  const cardStyle = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  return (
    <div className="pay-page-wrapper">
      <div className="checkout-card">
        <div className="checkout-header">
          <h1>Payment Details</h1>
          <div className="amount-badge">${bookingAmount}</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="stripe-input-container">
            <label>Credit or Debit Card</label>
            <div className="card-element-box">
              <CardElement options={cardStyle} />
            </div>
          </div>

          <button className="pay-button" disabled={!stripe || loading}>
            {loading ? "Processing..." : `Complete Booking`}
          </button>

          {error && <div className="error-msg">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;