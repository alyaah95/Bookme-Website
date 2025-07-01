// File: src/pages/offers/CityHotelsPage.jsx

import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchContext } from "../../context/SearchContext"; 
import { format } from 'date-fns';
import { DateRange } from 'react-date-range';
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import "./offers.css"; 
import "react-date-range/dist/styles.css"; 
import "react-date-range/dist/theme/default.css"; 


const CityHotelsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useContext(SearchContext);
  // Get data passed from the previous page: city name, list of hotels, and offer type
  const { city, hotels, offerType } = location.state || {}; 

  // State to manage date/options for each hotel card independently
  const [cardStates, setCardStates] = useState({});
  

  useEffect(() => {
    if (hotels && hotels.length > 0) {
      const initialCardStates = {};
      hotels.forEach(hotel => {
        initialCardStates[hotel.hotelId] = {
          openDate: false,
          dates: [{
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
          }],
          adults: 1,
          children: 0,
          rooms: 1,
        };
      });
      setCardStates(initialCardStates);
    }
  }, [hotels]);

  const handleCardStateChange = (hotelId, newState) => {
    setCardStates(prevStates => ({
      ...prevStates,
      [hotelId]: {
        ...prevStates[hotelId],
        ...newState,
      },
    }));
  };

  const handleSearch = (destination, dates, options, hotelId) => {
    dispatch({ type: "NEW_SEARCH", payload: { destination, dates, options } });
    navigate(`/hotels/${hotelId}`); // Navigate to the specific hotel details page
  };

  // Display a message if no hotels are available
  if (!city || !hotels || hotels.length === 0) {
    return (
      <div>
        <Navbar />
        <Header type="list" />
        <div className="container">
          <h2>No Hotels Available</h2>
          <p>Sorry, no hotels found for {city} under {offerType.charAt(0).toUpperCase() + offerType.slice(1)} offers.</p>
          {/* هذا هو التعديل الجديد: استخدم البيانات المخزنة في sessionStorage عند العودة */}
          <button className="back-button" onClick={() => {
            try {
                const storedCitiesData = sessionStorage.getItem('availableCitiesData');
                const storedOfferType = sessionStorage.getItem('selectedOfferType');
                if (storedCitiesData && storedOfferType) {
                    navigate('/available-cities', { 
                        state: { 
                            offerType: storedOfferType, 
                            cities: JSON.parse(storedCitiesData) 
                        } 
                    });
                } else {
                    // إذا لم يتم العثور على بيانات، ارجع للصفحة الرئيسية للعروض
                    navigate('/offers');
                }
            } catch (e) {
                console.error("Error parsing sessionStorage data for back navigation:", e);
                navigate('/offers'); // Fallback on error
            }
          }}>Back to Cities</button>
        </div>
        <div className="End_Page">
          <MailList />
          <Footer />
        </div>
      </div>
    );
  }
  

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="container">
        <h2>{city} - {offerType.charAt(0).toUpperCase() + offerType.slice(1)} Offers</h2>
        <p>Discover amazing deals in {city}:</p>

        <div className="hotels-list">
          {hotels.map((hotel) => { // Loop through each hotel
            const currentCardState = cardStates[hotel.hotelId] || {
              openDate: false, dates: [{ startDate: new Date(), endDate: new Date(), key: "selection" }],
              adults: 1, children: 0, rooms: 1,
            };

            return (
              <div key={hotel.hotelId} className="hotel-offer-card">
                <img src={hotel.hotelPhotos[0]} alt={hotel.hotelName} className="hotel-image" />
                <h3 className="hotel-name">{hotel.hotelName}</h3>
                <p className="hotel-address">{hotel.hotelAddress}</p>
                <p className="hotel-distance">{hotel.hotelDistance} from center</p>
                
                {/* Display main hotel offers (if any) from the Hotel Model */}
                {hotel.hotelOffers && hotel.hotelOffers.length > 0 && (
                  <div className="hotel-main-offer">
                    <h4>Hotel Main Offers:</h4>
                    {hotel.hotelOffers.map((offer, idx) => (
                      <div key={idx} className="offer-advertise">
                        <strong>{offer.title}</strong><br/>
                        <span>{offer.brief}</span><br/>
                        {/* Display price details if available in hotel-level offer */}
                        {offer.priceBefore && offer.priceAfter && (
                            <>
                                <span className="price-before">Was: ${offer.priceBefore}</span><br />
                                <span className="price-after">Now: ${offer.priceAfter.toFixed(2)}</span><br />
                                
                                <span className="percentage-saving">Save: {offer.percentageSaving}%</span><br />
                            </>
                        )}
                        {/* Display offer duration if available */}
                        {offer.from && offer.to && (
                            <span className="offer-duration">
                                Offer valid from {new Date(offer.from).toLocaleDateString()} to {new Date(offer.to).toLocaleDateString()}
                            </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Loop through rooms with descriptive offers for this hotel */}
                {hotel.roomsWithDescriptiveOffers && hotel.roomsWithDescriptiveOffers.length > 0 ? (
                  hotel.roomsWithDescriptiveOffers.map((room, roomIndex) => (
                    <div key={room.roomId} className="room-offer-details">
                      <h4 className="room-title-offer">{room.roomTitle}</h4>
                      {/* Display descriptive offers specific to this room */}
                      {room.roomDescriptiveOffers && room.roomDescriptiveOffers.length > 0 ? (
                        room.roomDescriptiveOffers.map((offer, offerIndex) => (
                          <div key={offerIndex} className="offer-details-content">
                            <p className="offer-header">{offer.title}</p>
                            <p className="offer-advertise">
                                <strong>Enjoy an amazing deal!</strong><br />
                                <span className="price-before">Was: ${offer.priceBefore}</span><br />
                                <span className="price-after">Now: ${offer.priceAfter.toFixed(2)}</span><br />
                                <span className="percentage-saving">Save: {offer.percentageSaving}%</span><br />
                                <span className="offer-duration">
                                    Offer valid from {new Date(offer.from).toLocaleDateString()} to {new Date(offer.to).toLocaleDateString()}
                                </span><br />
                                <span className="rOfferNote">Note: If selected dates fall outside the offer period, the additional days will be charged at the original room price.</span>
                            </p>
                            
                            {/* Booking inputs for each room's offer card */}
                            <div className="input-container">
                                <label>Check-in Date:</label>
                                <FontAwesomeIcon icon={faCalendarDays} className="headerIcon" />
                                <span
                                    onClick={() => handleCardStateChange(hotel.hotelId, { openDate: !currentCardState.openDate })}
                                    className="headerSearchText"
                                >{`${format(currentCardState.dates[0].startDate, "MM/dd/yyyy")} to ${format(currentCardState.dates[0].endDate, "MM/dd/yyyy")}`}</span>
                                {currentCardState.openDate && (
                                    <DateRange
                                        editableDateInputs={true}
                                        onChange={(item) => handleCardStateChange(hotel.hotelId, { dates: [item.selection] })}
                                        moveRangeOnFirstSelection={false}
                                        ranges={currentCardState.dates}
                                        className="date"
                                        minDate={new Date()}
                                    />
                                )}
                            </div>
                            <div className="input-container adults-input">
                                <label>Number of Adults:</label>
                                <input
                                    type="number"
                                    value={currentCardState.adults}
                                    onChange={e => handleCardStateChange(hotel.hotelId, { adults: parseInt(e.target.value) || 1 })}
                                    min="1"
                                />
                            </div>
                            <div className="input-container">
                                <label>Number of Children:</label>
                                <input
                                    type="number"
                                    value={currentCardState.children}
                                    onChange={e => handleCardStateChange(hotel.hotelId, { children: parseInt(e.target.value) || 0 })}
                                    min="0"
                                />
                            </div>
                            <div className="input-container">
                                <label>Number of Rooms:</label>
                                <input
                                    type="number"
                                    value={currentCardState.rooms}
                                    onChange={e => handleCardStateChange(hotel.hotelId, { rooms: parseInt(e.target.value) || 1 })}
                                    min="1"
                                />
                            </div>
                            <button
                                className="availability-button"
                                onClick={() => handleSearch(hotel.hotelCity, currentCardState.dates, { adult: currentCardState.adults, children: currentCardState.children, room: currentCardState.rooms }, hotel.hotelId)}
                            >
                                Book Now
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="no-room-offer-note">No specific offers for this room type. Check hotel-wide offers or contact us.</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="no-room-offer-note">No rooms with specific offers found for this hotel. Check hotel-wide offers.</p>
                )}
              </div>
            );
          })}
        </div>
        {/* هذا هو التعديل الجديد: استخدم البيانات المخزنة في sessionStorage عند العودة */}
        <button className="back-button" onClick={() => {
            try {
                const storedCitiesData = sessionStorage.getItem('availableCitiesData');
                const storedOfferType = sessionStorage.getItem('selectedOfferType');
                if (storedCitiesData && storedOfferType) {
                    navigate('/available-cities', { 
                        state: { 
                            offerType: storedOfferType, 
                            cities: JSON.parse(storedCitiesData) 
                        } 
                    });
                } else {
                    // إذا لم يتم العثور على بيانات، ارجع للصفحة الرئيسية للعروض
                    navigate('/offers');
                }
            } catch (e) {
                console.error("Error parsing sessionStorage data for back navigation:", e);
                navigate('/offers'); // Fallback on error
            }
        }}>Back to Cities</button>
      </div>
      <div className="End_Page">
        <MailList />
        <Footer />
      </div>
    </div>
  );
};

export default CityHotelsPage;