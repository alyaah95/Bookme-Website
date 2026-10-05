// File: src/pages/offers/HolidayOffers.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../utils/api';
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import "./offers.css";
import aidElFiter from "../../assets/images/aidElFiter.jpg";
import autamn from "../../assets/images/autamn.jpg";
import eidAladha from "../../assets/images/eidAladha.jpg";
import spring from "../../assets/images/spring.jpg";
import summer from "../../assets/images/summer.jpg";
import winter from "../../assets/images/winter.jpg";
import weekend from "../../assets/images/weekend.jpg";


const HolidayOffers = () => {
  const [allOffersData, setAllOffersData] = useState([]); // Stores all hotels with offers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffersData = async () => {
      try {
        // Fetch hotels with offer data from the backend
        const response = await api.get("/hotels/offersData"); 
        setAllOffersData(response.data);
      } catch (err) {
        setError("Failed to fetch offers. Please try again later.");
        console.error("Error fetching offers data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffersData();
  }, []);

  // Define static offer types for display
  const offerTypes = [
    { title: 'Summer Offers', key: 'summer offer', brief: 'Enjoy the summer with our special offers!', image: summer },
    { title: 'Winter Offers', key: 'winter offer', brief: 'Warm up with our winter deals!', image: winter },
    { title: 'Spring Offers', key: 'spring offer', brief: 'Bloom with our spring deals!', image: spring },
    { title: 'Autumn Offers', key: 'autumn offer', brief: 'Fall into savings with our autumn deals!', image: autamn },
    { title: 'Eid al-Fitr Offers', key: 'eid-al-fitr offer', brief: 'Celebrate Eid al-Fitr with our special offers!', image: aidElFiter },
    { title: 'Eid al-Adha Offers', key: 'eid-al-adha offer', brief: 'Celebrate Eid al-Adha with our special offers!', image: eidAladha },
    { title: 'Weekend Offers', key: 'weekend offer', brief: 'Enjoy your weekends with our special offers!', image: weekend },
  ];

  const handleOfferTypeClick = (offerKey) => {
    // Filter hotels based on the selected offer type (offerKind from hotel.offers)
    const filteredHotelsForOfferType = allOffersData.filter(item =>
      item.offerKind && item.offerKind.toLowerCase() === offerKey 
    );

    // Group these filtered hotels by city
    const citiesMap = new Map();
    filteredHotelsForOfferType.forEach(hotelData => {
      const city = hotelData.hotelCity;
      if (!citiesMap.has(city)) {
        citiesMap.set(city, {
          city: city,
          hotels: [] 
        });
      }
      citiesMap.get(city).hotels.push(hotelData); 
    });

    const citiesForSelectedOffer = Array.from(citiesMap.values());


    sessionStorage.setItem('availableCitiesData', JSON.stringify(citiesForSelectedOffer));
    sessionStorage.setItem('selectedOfferType', offerKey);

    if (citiesForSelectedOffer.length === 0) {
      navigate('/no-offers'); 
    } else {
      navigate('/available-cities', { 
        state: { 
          offerType: offerKey, 
          cities: citiesForSelectedOffer, 
        } 
      });
    }
  };

  if (loading) {
    return <p>Loading offers...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="container">
        <h2>Holiday Offers</h2>
        <p>Celebrate and save, what a great opportunity!</p>

        <div className="offers-grid">
          {offerTypes.map((offer) => (
            <div key={offer.key} className="offer-card" onClick={() => handleOfferTypeClick(offer.key)}>
              <img src={offer.image} alt={offer.title} className="offer-image" />
              <h3 className="offer-title">{offer.title}</h3>
              <p className="offer-brief">{offer.brief}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="End_Page">
        <MailList />
        <Footer />
      </div>
    </div>
  );
};

export default HolidayOffers;