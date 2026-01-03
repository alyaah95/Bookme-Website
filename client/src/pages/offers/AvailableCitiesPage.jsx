// File: src/pages/offers/AvailableCitiesPage.jsx

import React, { useEffect, useState } from 'react'; // أضفنا useEffect
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import "./offers.css"; 

const AvailableCitiesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get data from location.state first
  //let { offerType, cities } = location.state || {}; 
  
const [cities, setCities] = useState(location.state?.cities || []);
const [offerType, setOfferType] = useState(location.state?.offerType || "");

  // هذا هو التعديل الجديد: استعادة البيانات من sessionStorage إذا لم تكن موجودة
  /*useEffect(() => {
    if (!offerType || !cities || cities.length === 0) {
      try {
        const storedCitiesData = sessionStorage.getItem('availableCitiesData');
        const storedOfferType = sessionStorage.getItem('selectedOfferType');

        if (storedCitiesData && storedOfferType) {
          cities = JSON.parse(storedCitiesData);
          offerType = storedOfferType;
          // تحديث حالة الكومبوننت بالبيانات المستعادة
          // (لا يمكن تحديث المتغيرات مباشرة، يجب استخدام useState لو كانت هذه البيانات ستتغير)
          // بما أن هذه البيانات ثابتة للصفحة، يمكن استخدامها مباشرة بعد جلبها أو إعادة التوجيه
          // في هذا السيناريو، إذا كانت البيانات غير موجودة من location.state، سيتم معالجتها في شرط الـ if التالي
          // وتمريرها مرة أخرى عند النفيجيت
          if (cities.length > 0) {
              // هذا الشرط مهم لضمان عدم عرض 'No Cities' إذا كانت البيانات متاحة في sessionStorage
              // ويمكن إعادة توجيه المستخدم إذا لم يكن هناك بيانات في location.state
              // لكن بما أننا نستخدمها مباشرة، يكفي التعامل معها في شرط الـ if التالي
          }
        } else {
            // إذا لم يتم العثور على بيانات في sessionStorage، قم بإعادة التوجيه إلى صفحة العروض الرئيسية
            // لضمان بدء العملية من جديد
            navigate('/offers'); 
        }
      } catch (e) {
        console.error("Error parsing sessionStorage data:", e);
        navigate('/offers'); // Fallback to main offers page on error
      }
    }
  }, [offerType, cities, navigate]); // أضفنا offerType, cities, navigate كتوابع لـ useEffect */
  useEffect(() => {
    if (!offerType || cities.length === 0) {
      try {
        const storedCitiesData = sessionStorage.getItem('availableCitiesData');
        const storedOfferType = sessionStorage.getItem('selectedOfferType');

        if (storedCitiesData && storedOfferType) {
          setCities(JSON.parse(storedCitiesData));
          setOfferType(storedOfferType);
        } else {
          navigate('/offers');
        }
      } catch (e) {
        console.error("Error parsing sessionStorage data:", e);
        navigate('/offers');
      }
    }
  }, [offerType, cities.length, navigate]);

  // Handle cases where no data is passed or cities array is empty
  // (هذا الشرط الآن سيعالج البيانات سواء من location.state أو من sessionStorage)
  if (!offerType || !cities || cities.length === 0) {
    return (
      <div>
        <Navbar />
        <Header type="list" />
        <div className="container">
          <h2>No Cities Available</h2>
          <p>Sorry, there are no cities with offers for "{offerType}" at the moment.</p>
          <button className="back-button" onClick={() => navigate('/offers')}>Back to All Offers</button>
        </div>
        <div className="End_Page">
          <MailList />
          <Footer />
        </div>
      </div>
    );
  }

  const handleCityClick = (cityData) => {
    // Navigate to the city hotels page, passing selected city, offer type, and hotels in that city
    navigate('/city-hotels', {
      state: {
        city: cityData.city,       // City name
        offerType: offerType,      // Selected offer type
        hotels: cityData.hotels    // List of hotels in this city
      }
    });
  };

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="container">
        <h2>Cities for {offerType.charAt(0).toUpperCase() + offerType.slice(1)} Offers</h2>
        <p>Explore the cities offering great deals:</p>

        <div className="cities-grid">
          {cities.map((cityData) => ( // Loop through each city object
            <div key={cityData.city} className="city-card" onClick={() => handleCityClick(cityData)}>
              <h3 className="city-name">{cityData.city}</h3>
              <p>{cityData.hotels.length} hotels available</p> 
            </div>
          ))}
        </div>
        <button className="back-button" onClick={() => navigate('/offers')}>Back to All Offers</button>
      </div>
      <div className="End_Page">
        <MailList />
        <Footer />
      </div>
    </div>
  );
};

export default AvailableCitiesPage;