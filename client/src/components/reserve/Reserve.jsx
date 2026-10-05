import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { SearchContext } from "../../context/SearchContext";
import useFetch from "../../hooks/useFetch";
import api from "../../utils/api";
import "./reserve.css";
//import { v4 as uuidv4 } from 'uuid';

const Reserve = ({ setOpen, hotelId }) => {
  const [selectedRooms, setSelectedRooms] = useState([]);
  const roomdata = useFetch(`/hotels/room/${hotelId}`);
  const hoteldata = useFetch(`/hotels/find/${hotelId}`);
  const { dates, options } = useContext(SearchContext);
  const { user  } = useContext(AuthContext);

  const adultCount = options?.adult || 1; 
  const childrenCount = options?.children || 0;
  /* generateCustomUUID = () => {
    const uuid = uuidv4();
    if (!user.CurrentBookings.some(booking => booking.id === uuid.replace(/-/g, '').substring(0, 22))) {
      return uuid.replace(/-/g, '').substring(0, 22);
    }
  };*/

  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const date = new Date(start.getTime());
    const dates = [];
    while (date <= end) {
      dates.push(new Date(date).getTime());
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  const alldates = getDatesInRange(dates[0].startDate, dates[0].endDate);

  const isAvailable = (roomNumber) => {
    // convert all dates to a consistent format (YYYY-MM-DD) for comparison
    const formattedAllDates = alldates.map((d) =>
      new Date(d).toISOString().split("T")[0]
    );

    const isFound = roomNumber.unavailableDates.some((date) => {
      const formattedUnavailableDate = new Date(date).toISOString().split("T")[0];
      return formattedAllDates.includes(formattedUnavailableDate);
    });

    return !isFound;
  };

  const handleSelect = (e) => {
    const checked = e.target.checked;
    const value = e.target.value;
    setSelectedRooms(
      checked
        ? [...selectedRooms, value]
        : selectedRooms.filter((item) => item !== value)
    );
  };

  const navigate = useNavigate();

  const searchRoomsForHotels = async (hotelRooms, selectedRoomNumbers) => {
    try {
      const roomTitles = [];
      for (const roomId of hotelRooms) {
        const room = roomdata.data.find(room => (room._id?._id || room._id) === roomId);
        if (!room) {
          throw new Error(`Room with ID ${roomId} not found`);
        }
        for (const roomNumber of room.roomNumbers) {
          if (selectedRoomNumbers.includes(roomNumber._id.toString())) {
            roomTitles.push(room.title);
            break;
          }
        }
      }
      return roomTitles;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to search rooms for hotels');
    }
  };

  const calculateRoomPrice = (room, selectedDates) => {
    let totalPrice = 0;
    selectedDates.forEach(date => {
      let isOfferApplied = false;
      if (room.offers && room.offers.length > 0) {
        room.offers.forEach(offer => {
          const offerStart = new Date(offer.from).getTime();
          const offerEnd = new Date(offer.to).getTime();
          if (date >= offerStart && date <= offerEnd) {
            totalPrice += offer.priceAfter;
            isOfferApplied = true;
          }
        });
      }
      if (!isOfferApplied) {
        totalPrice += room.price;
      }
    });
    return totalPrice;
  };

  const getReservation = async (hotelRooms, selectedRoomNumbers) => {
    try {
      const roomDetails = [];
      let totalPrice = 0;

      for (const roomId of hotelRooms) {
        const room = roomdata.data.find(room => room._id === roomId);
        if (!room) {
          throw new Error(`Room with ID ${roomId} not found`);
        }

        let selectedRoomCount = 0;
        let roomTotalPrice = 0;
        const selectedRoomsId =[];
        const selectedRoomsNums=[];
        
        for (const roomNumber of room.roomNumbers) {
          if (selectedRoomNumbers.includes(roomNumber._id.toString())) {
            selectedRoomCount++;
            selectedRoomsId.push(roomNumber._id.toString());
            selectedRoomsNums.push(roomNumber.number);
            roomTotalPrice += calculateRoomPrice(room, alldates);
          }
        }

        totalPrice += roomTotalPrice;
        
        roomDetails.push({
          hotelId:hotelId,
          roomtitle: room.title,
          roomid:room._id,
          selectedRoomCount,
          selectedRoomsId:selectedRoomsId,
          selectedRoomsNums:selectedRoomsNums,
          roomPrice: roomTotalPrice,
        });
      }
      
      return {totalPrice, roomDetails};
    } catch (error) {
      console.error(error);
      throw new Error('Failed to search rooms for hotels');
    }
  };

  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24
  function dayDifference(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
    return diffDays;
  }

  const days = dayDifference(dates[0].endDate, dates[0].startDate);
  const fparts = dates[0].startDate.toString().split(" ");
  const tparts = dates[0].endDate.toString().split(" ");
  const fromDate = `${fparts[0]}, ${fparts[1]} ${fparts[2]}, ${fparts[3]}`;
  const toDate = `${tparts[0]}, ${tparts[1]} ${tparts[2]}, ${tparts[3]}`;

  const addBookingCard = async () => {
    try {
      const roomIdsOnly = hoteldata.data.rooms.map(room => room._id || room);
      const roomNames = await searchRoomsForHotels(roomIdsOnly, selectedRooms);
      const reservationData = await getReservation(roomIdsOnly, selectedRooms);
      const roomsTotalPrice = reservationData.totalPrice;
      const RoomDetails = reservationData.roomDetails.filter(room => roomNames.includes(room.roomtitle));

      const bookingCard = {
        fromDate: fromDate,
        toDate: toDate,
        city: hoteldata.data.city,
        numberOfAdults: options.adult,
        numberOfChildren: options.children,
        hotelName: hoteldata.data.name,
        numberOfRooms: selectedRooms.length,
        roomNames: roomNames,
        ReservationDetails: RoomDetails,
        totalCost: Math.round(roomsTotalPrice + (days * hoteldata.data.cheapestPrice))
      };

      const userId = user._id; 


      
      await api.post(`/users/${userId}/currentbookings`, {
        bookingCard: bookingCard, 
        userId: userId
      });


      
      setOpen(false);
      navigate('/pay', {state: {amount: bookingCard.totalCost}});

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add booking';
      console.error('Error adding booking:', errorMsg);
      alert(errorMsg); 
    }
  };

  const handleClick = async () => {
    try {
      if (selectedRooms.length === 0) {
        alert("Please select the rooms before reserving.");
        return;
      }

      const roomIdsOnly = hoteldata.data.rooms.map(room => room._id || room);
      const roomNames = await searchRoomsForHotels(roomIdsOnly, selectedRooms);
      const reservationData = await getReservation(roomIdsOnly, selectedRooms);
      const RoomDetails = reservationData.roomDetails.filter(room => roomNames.includes(room.roomtitle));
      
      const bookingData = {
        amount:reservationData.totalPrice + (days * hoteldata.data.cheapestPrice),
        details: {
          fromDate: fromDate,
          toDate: toDate,
          city: hoteldata.data.city,
          numberOfAdults: adultCount,
          numberOfChildren: childrenCount,
          hotelName: hoteldata.data.name,
          numberOfRooms: selectedRooms.length,
          roomNames: roomNames,
          selectedRooms: selectedRooms, 
          ReservationDetails: RoomDetails,
          totalCost: reservationData.totalPrice + (days * hoteldata.data.cheapestPrice),
          alldates: alldates 
        }
      };

      setOpen(false);
      navigate('/pay', { state: bookingData });

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="reserve">
      <div className="rContainer">
        <FontAwesomeIcon
          icon={faCircleXmark}
          className="rClose"
          onClick={() => setOpen(false)}
        />
        <span>Select your rooms:</span>
        {roomdata.data.map((item) => (
          <div className="rItem" key={item._id}>
            <div className="rItemInfo">
              <div className="rTitle">{item.title}</div>
              <div className="rDesc">{item.desc}</div>
              <div className="rMax">
                Max people: <b>{item.maxPeople}</b>
              </div>
              {!item.offers || item.offers.length === 0 ? (
                <div className="rPrice">${item.price}</div>
              ) : (
                item.offers.map((offer, index) => (
                  <div key={index} className="rOffer">
                    <p className="rOfferPriceBefore">${Math.round(offer.priceBefore)}</p>
                    <p className="rOfferPriceAfter">${Math.round(offer.priceAfter)}</p>
                    <p className="rOfferSaving">Save: {offer.percentageSaving}%</p>
                    <p className="rOfferValidity">Valid from: {new Date(offer.from).toLocaleDateString()} to {new Date(offer.to).toLocaleDateString()}</p>
                    <p className="rOfferNote">Note: If selected dates fall outside the offer period, the additional days will be charged at the original room price.</p>
                  </div>
                ))
              )}
            </div>
            <div className="rSelectRooms">
              {item.roomNumbers.map((roomNumber) => (
                <div className="room" key={roomNumber._id}>
                  <label>{roomNumber.number}</label>
                  <input
                    type="checkbox"
                    value={roomNumber._id}
                    onChange={handleSelect}
                    disabled={!isAvailable(roomNumber)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={handleClick} className="rButton">
          Reserve Now!
        </button>
      </div>
    </div>
  );
};

export default Reserve;
