import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../../components/checkoutForm/CheckoutForm.jsx";
import { useLocation } from "react-router-dom";
import "./pay.css";

// حطي هنا الـ Publishable key بتاعك
const stripePromise = loadStripe("pk_test_51Skvrg38uyLp0lXPZrnNyxhn942TXDHF1eoGROob51hQ8NxwuwbFvikZHNe3pZD23Td3kVbAXMDHf3poPZV1ZMjo00otW4cBta",{locale: 'en',});

const Pay = () => {
  const location = useLocation();
 const bookingAmount = location.state?.amount || 0;
const bookingDetails = location.state?.details || null;

  return (
    <div className="pay-container">
      <Elements stripe={stripePromise}>
        <CheckoutForm 
          bookingAmount={bookingAmount} 
          bookingDetails={bookingDetails}
        />
      </Elements>
    </div>
  );
};

export default Pay;