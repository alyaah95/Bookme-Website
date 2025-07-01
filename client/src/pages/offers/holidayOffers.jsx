// File: src/pages/offers/HolidayOffers.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import "./offers.css";

const HolidayOffers = () => {
  const [allOffersData, setAllOffersData] = useState([]); // Stores all hotels with offers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffersData = async () => {
      try {
        // Fetch hotels with offer data from the backend
        // ملاحظة: تأكدي من أن الـ API endpoint هنا مطابق للمسار في الـ Backend
        // إذا كان المسار في الـ Backend هو /hotels/offersData، اتركيها كما هي
        // إذا كان /api/offersData، قومي بتعديلها
        const response = await axios.get("/hotels/offersData"); 
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
    { title: 'Summer Offers', key: 'summer offer', brief: 'Enjoy the summer with our special offers!', image: '/images/summer_offer.jpg' },
    { title: 'Winter Offers', key: 'winter offer', brief: 'Warm up with our winter deals!', image: '/images/winter_offer.jpg' },
    { title: 'Spring Offers', key: 'spring offer', brief: 'Bloom with our spring deals!', image: '/images/spring_offer.jpg' },
    { title: 'Autumn Offers', key: 'autumn offer', brief: 'Fall into savings with our autumn deals!', image: '/images/autumn_offer.jpg' },
    { title: 'Eid al-Fitr Offers', key: 'eid-al-fitr offer', brief: 'Celebrate Eid al-Fitr with our special offers!', image: '/images/eid_fitr_offer.jpg' },
    { title: 'Eid al-Adha Offers', key: 'eid-al-adha offer', brief: 'Celebrate Eid al-Adha with our special offers!', image: '/images/eid_adha_offer.jpg' },
    { title: 'Weekend Offers', key: 'weekend offer', brief: 'Enjoy your weekends with our special offers!', image: '/images/weekend_offer.jpg' },
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

    // هذا هو التعديل الجديد: تخزين بيانات المدن في sessionStorage
    // لتكون متاحة عند الرجوع للصفحة مرة أخرى
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