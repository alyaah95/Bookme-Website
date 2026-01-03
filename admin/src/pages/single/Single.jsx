import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import List from "../../components/table/Table"; // جدول الحجوزات الحالي
import "./single.scss";
import API from "../../api/axiosInstance";
import UpdateModal from '../../components/updateModal/UpdateModal';
import Swal from 'sweetalert2';

const Single = () => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const { userId, productId } = useParams();
  const id = userId || productId;

  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(true);
  const [openUpdate, setOpenUpdate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (path === "hotels") {
          const response = await API.get(`/hotels/find/${id}`);
          setItem(response.data);
        } else {
          const response = await API.get(`/${path}/${id}`);
          setItem(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [path, id]);

  const handleDelete = async () => {
    // 1. سؤال الأدمن للتأكيد قبل المحاولة
    const { isConfirmed } = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!isConfirmed) return;

    try {
      if (path === "rooms") {
        const hotelId = item.hotelId?._id || item.hotelId;
        await API.delete(`/rooms/${id}/${hotelId}`);
      } else {
        await API.delete(`/${path}/${id}`);
      }
      
      // نجاح المسح
      await Swal.fire('Deleted!', 'Item has been deleted successfully.', 'success');
      window.location.replace(`/${path}`);
    } catch (err) {
      // جلب الرسالة من الباك أند
      const errorMsg = err.response?.data?.message || "Sorry, you cannot delete this item.";
      
      // إظهار التنبيه باستخدام SweetAlert2 لأنه لا يمكن حجبه من المتصفح
      Swal.fire({
        icon: 'error',
        title: 'Deletion Failed',
        text: errorMsg,
      });

      console.error("Full Error Object:", err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="top">
          <div className="left">
            <div className="editButton" onClick={() => setOpenUpdate(true)}>Edit</div>
            <div className="deleteButton" onClick={handleDelete} style={{color: "red", cursor: "pointer"}}>Delete</div>
            <h1 className="title">{path.toUpperCase()} INFORMATION</h1>
            <div className="item">
              <img
                src={item.img || item.photos?.[0] || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
                alt=""
                className="itemImg"
              />
              <div className="details">
                <h1 className="itemTitle">{item.username || item.name || item.title}</h1>
                
                {/* --- تفاصيل المستخدم --- */}
                {path === "users" && (
                  <div className="infoGrid">
                    <div className="detailItem"><span className="itemKey">Email:</span> <span className="itemValue">{item.email}</span></div>
                    <div className="detailItem"><span className="itemKey">Phone:</span> <span className="itemValue">{item.phone}</span></div>
                    <div className="detailItem"><span className="itemKey">Address:</span> <span className="itemValue">{item.city}, {item.country}</span></div>
                    <div className="detailItem"><span className="itemKey">Status:</span> <span className="itemValue">{item?.isAdmin ? "Admin" : "User"}</span></div>
                  </div>
                )}

                {/* --- تفاصيل الفندق --- */}
                {path === "hotels" && (
                  <>
                  <div className="infoGrid">
                    <div className="detailItem"><span className="itemKey">Type:</span> <span className="itemValue">{item.type}</span></div>
                    <div className="detailItem"><span className="itemKey">City:</span> <span className="itemValue">{item.city}</span></div>
                    <div className="detailItem"><span className="itemKey">Address:</span> <span className="itemValue">{item.address}</span></div>
                    <div className="detailItem"><span className="itemKey">Distance:</span> <span className="itemValue">{item.distance}m from center</span></div>
                    <div className="detailItem"><span className="itemKey">Price:</span> <span className="itemValue">${item.cheapestPrice}</span></div>
                    <div className="detailItem"><span className="itemKey">Rating:</span> <span className="itemValue">{item.rating || "No rating"} ⭐</span></div>
                  </div>
                  {/* قسم الغرف التابعة للفندق */}
                  <div className="hotelRoomsSection">
                    <h2 className="title">Included Rooms</h2>
                    <div className="roomsWrapper">
                      {item.rooms?.map((room) => (
                        <div key={room._id} className="roomInfoCard">
                          <div className="roomDetail">
                            <span className="roomLabel">Title:</span>
                            <span className="roomValue">{room.title}</span>
                          </div>
                          <div className="roomDetail">
                            <span className="roomLabel">Price:</span>
                            <span className="roomValue">${room.price}</span>
                          </div>
                          <div className="roomDetail">
                            <span className="roomLabel">Capacity:</span>
                            <span className="roomValue">{room.maxPeople} Persons</span>
                          </div>
                          <Link to={`/rooms/${room._id}`} className="viewRoomLink">
                            View Details
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                  </>
                )}

                {/* --- تفاصيل الغرفة --- */}
                {path === "rooms" && (
                  <>
                  <div className="infoGrid">
                    <div className="detailItem"><span className="itemKey">Price:</span> <span className="itemValue">${item.price}</span></div>
                    <div className="detailItem"><span className="itemKey">Max People:</span> <span className="itemValue">{item.maxPeople}</span></div>
                    <div className="detailItem"><span className="itemKey">Description:</span> <span className="itemValue">{item.desc}</span></div>
                    <div className="detailItem"><span className="itemKey">Hotel ID:</span> <span className="itemValue">{item?.hotelId?._id || "Not Linked"}</span></div>
                    <div className="detailItem"><span className="itemKey">Hotel Name:</span> <span className="itemValue">{item?.hotelId?.name || "Not Linked"}</span></div>
                    <Link to={item.hotelId ? `/hotels/${item.hotelId._id}` : "#"} className="viewHotelLink">
                      View Hotel
                    </Link>

                  </div>
                  <div className="roomNumbersSection">
                    <h2 className="title">Available Room Numbers</h2>
                    <div className="numbersContainer">
                      {item.roomNumbers?.map((rn) => (
                        <div key={rn._id} className="numberBadge">
                          <span className="num">Room #{rn.number}</span>
                          <small className="dateCount">
                            {rn.unavailableDates?.length} booked dates
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>
                  </>
                )}
                
              </div>
            </div>
            {openUpdate && (
              <UpdateModal 
                setOpen={setOpenUpdate} 
                type={path} 
                item={item} 
                id={id} 
              />
            )}
          </div>
        </div>

        {/* --- الأقسام السفلية (المصفوفات المعقدة) --- */}
        <div className="bottomSections">
          
          {/* 1. عروض الفندق أو الغرفة */}
          {(item.offers && item.offers.length > 0) && (
            <div className="sectionBox">
              <h2 className="title">Active Offers</h2>
              <div className="offersList">
                {item.offers.map((offer, index) => (
                  <div key={index} className="offerCard">
                    <b>{offer.offerKind || offer.title}</b>
                    {offer.percentageSaving && <p>Discount: {offer.percentageSaving}%</p>}
                    {offer.priceAfter && <p>New Price: ${offer.priceAfter}</p>}
                    <p>{offer.details || offer.brief}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. حجوزات المستخدم (Current & History) */}
          {path === "users" && (
            <>
              <div className="sectionBox">
                <h2 className="title">Current Bookings</h2>
                <List userId={id} /> {/* الجدول اللي إنتي عاملاه أصلاً */}
              </div>
              {item.HistoryBookings?.length > 0 && (
                <div className="sectionBox">
                  <h2 className="title">History Bookings</h2>
                  <div className="historyGrid">
                    {item.HistoryBookings.map((h, i) => <div key={i} className="historyItem">{h.hotelName} - {h.totalCost}$</div>)}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 3. رسائل المستخدم أو المراجعات */}
          {item.Messages?.length > 0 && (
            <div className="sectionBox">
              <h2 className="title">User Messages</h2>
              {item.Messages.map((m, i) => (
                <div key={i} className="msgItem">
                  <b>{m.name}:</b> {m.message} <small>{new Date(m.date).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Single;