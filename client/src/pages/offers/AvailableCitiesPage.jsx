// File: src/pages/offers/AvailableCitiesPage.jsx

import React, { useEffect, useState } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import "./offers.css"; 
import dahab from "../../assets/images/dahab.jpg";
import beirut from "../../assets/images/beirut.jpg";
import tangier from "../../assets/images/tangier.jpg";
import cairo from "../../assets/images/cairo.jpg";
import hurgauda from "../../assets/images/hurguda.jpg";
import rome from "../../assets/images/rome.jpg";
import venice from "../../assets/images/venice.jpg";

const AvailableCitiesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get data from location.state first
  //let { offerType, cities } = location.state || {}; 
  
  const [cities, setCities] = useState(location.state?.cities || []);
  const [offerType, setOfferType] = useState(location.state?.offerType || "");

  const cityImages = {
  "Dahab": dahab,
  "Beirut": beirut,
  "Tangier": tangier,
  "Cairo": cairo,
  "Hurgauda": hurgauda,
  "Rome": rome,
  "Venice": venice
};


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
          {cities.map((cityData) => {
            const imgUrl = cityImages[cityData.city] || cityImages.default;

            return (
              <div 
                key={cityData.city} 
                className="city-card" 
                onClick={() => handleCityClick(cityData)}
              >
                <img 
                  src={imgUrl} 
                  alt={cityData.city} 
                  className="city-image" 
                />
                <div className="city-info">
                  <h3 className="city-name">{cityData.city}</h3>
                  <p>{cityData.hotels.length} hotels available</p> 
                </div>
              </div>
            );
          })}
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