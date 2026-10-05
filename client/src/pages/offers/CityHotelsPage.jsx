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

  // Tab switching function
  const switchTab = (event, tabIndex) => {
    const tabs = event.target.parentElement;
    const tabContent = tabs.nextElementSibling;
    
    // Remove active class from all tabs and panels
    tabs.querySelectorAll('.offer-tab').forEach(tab => tab.classList.remove('active'));
    tabContent.querySelectorAll('.offer-tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding panel
    tabs.querySelectorAll('.offer-tab')[tabIndex].classList.add('active');
    tabContent.querySelectorAll('.offer-tab-panel')[tabIndex].classList.add('active');
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
                    navigate('/offers');
                }
            } catch (e) {
                console.error("Error parsing sessionStorage data for back navigation:", e);
                navigate('/offers');
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
          {hotels.map((hotel) => {
            const currentCardState = cardStates[hotel.hotelId] || {
              openDate: false, 
              dates: [{ startDate: new Date(), endDate: new Date(), key: "selection" }],
              adults: 1, 
              children: 0, 
              rooms: 1,
            };

            return (
              <div key={hotel.hotelId} className="hotel-offer-card">
                
                {/* HOTEL HEADER with Hero Image */}
                <div className="hotel-header">
                  <img src={hotel.hotelPhotos[0]} alt={hotel.hotelName} className="hotel-image" />
                  <div className="hotel-info-overlay">
                    <h3 className="hotel-name">{hotel.hotelName}</h3>
                    <p className="hotel-address">{hotel.hotelAddress}</p>
                    <p className="hotel-distance">{hotel.hotelDistance} from center</p>
                  </div>
                </div>

                {/* HOTEL CONTENT */}
                <div className="hotel-content">
                  
                  {/* Hotel-Level Offers Banner (if any) */}
                  {hotel.hotelOffers && hotel.hotelOffers.length > 0 && (
                    <div className="hotel-main-offer">
                      <h4>Hotel Main Offers</h4>
                      {hotel.hotelOffers.map((offer, idx) => (
                        <div key={idx} className="offer-advertise">
                          <strong>{offer.title}</strong>
                          <span>{offer.brief}</span>
                          {offer.priceBefore && offer.priceAfter && (
                            <>
                              <span className="price-before">Was: ${offer.priceBefore}</span>
                              <span className="price-after">Now: ${offer.priceAfter.toFixed(2)}</span>
                              <span className="percentage-saving">Save: {offer.percentageSaving}%</span>
                            </>
                          )}
                          {offer.from && offer.to && (
                            <span className="offer-duration">
                              Offer valid from {new Date(offer.from).toLocaleDateString()} to {new Date(offer.to).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ROOM OFFERS with Tabbed Interface */}
                  {hotel.roomsWithDescriptiveOffers && hotel.roomsWithDescriptiveOffers.length > 0 ? (
                    hotel.roomsWithDescriptiveOffers.map((room) => (
                      <div key={room.roomId} className="room-offer-details">
                        <h4 className="room-title-offer">{room.roomTitle}</h4>

                        {/* Room Descriptive Offers */}
                        {room.roomDescriptiveOffers && room.roomDescriptiveOffers.length > 0 ? (
                          room.roomDescriptiveOffers.map((offer, offerIndex) => (
                            <div key={offerIndex} className="offer-details-content">
                              
                              {/* TABBED NAVIGATION */}
                              <div className="offer-tabs">
                                <button 
                                  className="offer-tab active" 
                                  onClick={(e) => switchTab(e, 0)}
                                >
                                  Information
                                </button>
                                <button 
                                  className="offer-tab" 
                                  onClick={(e) => switchTab(e, 1)}
                                >
                                  Pricing
                                </button>
                                <button 
                                  className="offer-tab" 
                                  onClick={(e) => switchTab(e, 2)}
                                >
                                  Booking
                                </button>
                              </div>

                              {/* TAB CONTENT */}
                              <div className="offer-tab-content">
                                
                                {/* TAB 1: INFORMATION */}
                                <div className="offer-tab-panel active">
                                  <h5 className="offer-header">{offer.title}</h5>
                                  
                                  <div className="offer-info-grid">
                                    <div className="offer-info-item">
                                      <div className="offer-info-icon">📅</div>
                                      <div className="offer-info-text">
                                        <div className="offer-info-label">Valid Period</div>
                                        <div className="offer-info-value">
                                          {new Date(offer.from).toLocaleDateString()} - {new Date(offer.to).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="offer-info-item">
                                      <div className="offer-info-icon">💰</div>
                                      <div className="offer-info-text">
                                        <div className="offer-info-label">You Save</div>
                                        <div className="offer-info-value">{offer.percentageSaving}%</div>
                                      </div>
                                    </div>

                                    <div className="offer-info-item">
                                      <div className="offer-info-icon">🏷️</div>
                                      <div className="offer-info-text">
                                        <div className="offer-info-label">Original Price</div>
                                        <div className="offer-info-value">${offer.priceBefore}</div>
                                      </div>
                                    </div>

                                    <div className="offer-info-item">
                                      <div className="offer-info-icon">✨</div>
                                      <div className="offer-info-text">
                                        <div className="offer-info-label">Special Rate</div>
                                        <div className="offer-info-value">${Math.round(offer.priceAfter)}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <p className="rOfferNote">
                                    <strong>Important:</strong> If your selected dates fall outside the offer period, 
                                    the additional days will be charged at the original room price of ${offer.priceBefore} per night.
                                  </p>
                                </div>

                                {/* TAB 2: PRICING */}
                                <div className="offer-tab-panel">
                                  <div className="pricing-display">
                                    <div className="price-comparison">
                                      <span className="price-before">${offer.priceBefore}</span>
                                      <span className="price-after">
                                        <span className="price-currency">$</span>
                                        {Math.round(offer.priceAfter)}
                                      </span>
                                      <span className="percentage-saving">
                                        Save {offer.percentageSaving}%
                                      </span>
                                    </div>
                                    
                                    <p className="pricing-note">
                                      This special promotional rate is available exclusively for stays between{' '}
                                      <strong>{new Date(offer.from).toLocaleDateString()}</strong> and{' '}
                                      <strong>{new Date(offer.to).toLocaleDateString()}</strong>. 
                                      Book now to secure this limited-time offer!
                                    </p>
                                  </div>
                                </div>

                                {/* TAB 3: BOOKING */}
                                <div className="offer-tab-panel">
                                  <div className="booking-form">
                                    
                                    {/* Date Selection */}
                                    <div className="input-container">
                                      <label>Check-in & Check-out Dates</label>
                                      <div
                                        onClick={() => handleCardStateChange(hotel.hotelId, { 
                                          openDate: !currentCardState.openDate 
                                        })}
                                        className="headerSearchText"
                                      >
                                        <FontAwesomeIcon icon={faCalendarDays} className="headerIcon" />
                                        <span>
                                          {format(currentCardState.dates[0].startDate, "MM/dd/yyyy")} to{' '}
                                          {format(currentCardState.dates[0].endDate, "MM/dd/yyyy")}
                                        </span>
                                      </div>
                                      {currentCardState.openDate && (
                                        <DateRange
                                          editableDateInputs={true}
                                          onChange={(item) => handleCardStateChange(hotel.hotelId, { 
                                            dates: [item.selection] 
                                          })}
                                          moveRangeOnFirstSelection={false}
                                          ranges={currentCardState.dates}
                                          className="date"
                                          minDate={new Date()}
                                        />
                                      )}
                                    </div>

                                    {/* Guest & Room Selection */}
                                    <div className="booking-row">
                                      <div className="input-container">
                                        <label>Number of Adults</label>
                                        <input
                                          type="number"
                                          value={currentCardState.adults}
                                          onChange={e => handleCardStateChange(hotel.hotelId, { 
                                            adults: parseInt(e.target.value) || 1 
                                          })}
                                          min="1"
                                        />
                                      </div>

                                      <div className="input-container">
                                        <label>Number of Children</label>
                                        <input
                                          type="number"
                                          value={currentCardState.children}
                                          onChange={e => handleCardStateChange(hotel.hotelId, { 
                                            children: parseInt(e.target.value) || 0 
                                          })}
                                          min="0"
                                        />
                                      </div>

                                      {/* <div className="input-container">
                                        <label>Number of Rooms</label>
                                        <input
                                          type="number"
                                          value={currentCardState.rooms}
                                          onChange={e => handleCardStateChange(hotel.hotelId, { 
                                            rooms: parseInt(e.target.value) || 1 
                                          })}
                                          min="1"
                                        />
                                      </div> */}
                                    </div>

                                    {/* Book Now Button */}
                                    <button
                                      className="availability-button"
                                      onClick={() => handleSearch(
                                        hotel.hotelCity,
                                        currentCardState.dates,
                                        { 
                                          adult: currentCardState.adults,
                                          children: currentCardState.children,
                                          room: currentCardState.rooms 
                                        },
                                        hotel.hotelId
                                      )}
                                    >
                                      Know More About Your Hotel & Book Now!
                                    </button>

                                  </div>
                                </div>

                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="no-room-offer-note">
                            No specific offers available for this room type. Please check our hotel-wide offers above or contact us for assistance.
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="no-room-offer-note">
                      No rooms with specific offers found for this hotel. Please check hotel-wide offers or contact us.
                    </p>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* Back Button */}
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
                    navigate('/offers');
                }
            } catch (e) {
                console.error("Error parsing sessionStorage data for back navigation:", e);
                navigate('/offers');
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