import {
  faBed,
  faCalendarDays,
  faDollar,
  faHome,
  faPerson,
  faPhone
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";
import { useContext, useState } from "react";
//import { Link } from "react-router-dom";
import React from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { SearchContext } from "../../context/SearchContext";
import "./header.css";

const Header = ({ type }) => {
  const [destination, setDestination] = useState("");
  const [openDate, setOpenDate] = useState(false);
  const [dates, setDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [openOptions, setOpenOptions] = useState(false);
  const [options, setOptions] = useState({
    adult: 1,
    children: 0,
    room: 1,
  });

  const [activeItem, setActiveItem] = useState("Home"); // State to track active item

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);


  const handleOption = (name, operation) => {
    setOptions((prev) => {
      return {
        ...prev,
        [name]: operation === "i" ? options[name] + 1 : options[name] - 1,
      };
    });
  };

  const { dispatch } = useContext(SearchContext);

  const handleSearch = () => {
    dispatch({ type: "NEW_SEARCH", payload: { destination, dates, options } });
    navigate("/hotels", { state: { destination, dates, options } });
  };
  
  const location = useLocation();
  React.useEffect(() => {
    switch (location.pathname) {
      case "/":
        setActiveItem("Home");
        break;
      case "/offers":
        setActiveItem("Offers");
        break;
      case "/contact":
        setActiveItem("Contact");
        break;
      default:
        setActiveItem("Home");
    }
  }, [location.pathname]);

  // Function to handle navigation and set active item
  
  

  return (
    <div className="header">
      <div
        className={
          type === "list" ? "headerContainer listMode" : "headerContainer"
        }
      >
        <div className="headerList">
          <div
            className={
              activeItem === "Home" ? "headerListItem active" : "headerListItem"
            }
            onClick={() => {
              setActiveItem("Home");
              navigate("/");
            }}
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </div>
          <div
            className={
              activeItem === "Offers"
                ? "headerListItem active"
                : "headerListItem"
            }
            onClick={() => {
              setActiveItem("Offers");
              navigate("/offers");
            }}
          >
            <FontAwesomeIcon icon={faDollar} />
            <span>Offers & Inspiration</span>
          </div>
          <div
            className={
              activeItem === "Contact"
                ? "headerListItem active"
                : "headerListItem"
            }
            onClick={() => {
              setActiveItem("Contact");
              navigate("/contact");
            }}
          >
            <FontAwesomeIcon icon={faPhone} />
            <span>Contact</span>
          </div>
        </div>
        {type !== "list" && (
          <>
            <h1 className="headerTitle">
             Enjoy Your Vacation With Us,
            </h1>
            <p className="headerDesc">
              Get rewarded for your travels – unlock instant savings of 10% or
              more with a free Book Me account
            </p>

            {!user && <button className="headerBtn" onClick={() => navigate("/register")}>Register</button>}
            {!user && <button className="headerBtn" onClick={() => navigate("/login")}>Login in </button>}
            
            <div className="headerSearch">
              <div className="headerSearchItem">
                <FontAwesomeIcon icon={faBed} className="headerIcon" />
                <input
                  type="text"
                  placeholder="Where are you going?"
                  className="headerSearchInput"
                  onChange={(e) => {
                    // جلب القيمة المدخلة من حقل البحث
                    const inputValue = e.target.value;
                
                    // 1. إزالة المسافات الزائدة من البداية والنهاية
                    const trimmedValue = inputValue.trim();
                
                    // 2. تقسيم النص إلى كلمات بناءً على المسافات، ثم تحويل الحرف الأول من كل كلمة إلى كابيتال
                    // 3. إعادة تجميع الكلمات بدون مسافات إضافية بينها
                    const formattedDestination = trimmedValue
                        .split(/\s+/) // تقسيم النص عند وجود مسافة واحدة أو أكثر
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // تحويل أول حرف لكابيتال والباقي سمول
                        .join(' '); // تجميع الكلمات بمسافة واحدة بينها
                
                    // تحديث حالة الـ destination بالقيمة المنسقة
                    setDestination(formattedDestination);
                }}
                />
              </div>
              <div className="headerSearchItem">
                <FontAwesomeIcon icon={faCalendarDays} className="headerIcon" />
                <span
                  onClick={() => setOpenDate(!openDate)}
                  className="headerSearchText"
                >{`${format(dates[0].startDate, "MM/dd/yyyy")} to ${format(
                  dates[0].endDate,
                  "MM/dd/yyyy"
                )}`}</span>
                {openDate && (
                  <DateRange
                    editableDateInputs={true}
                    onChange={(item) => setDates([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={dates}
                    className="date"
                    minDate={new Date()}
                  />
                )}
              </div>
              <div className="headerSearchItem">
                <FontAwesomeIcon icon={faPerson} className="headerIcon" />
                <span
                  onClick={() => setOpenOptions(!openOptions)}
                  className="headerSearchText"
                >{`${options.adult} adult · ${options.children} children · ${options.room} room`}</span>
                {openOptions && (
                  <div className="options">
                    <div className="optionItem">
                      <span className="optionText">Adult</span>
                      <div className="optionCounter">
                        <button
                          disabled={options.adult <= 1}
                          className="optionCounterButton"
                          onClick={() => handleOption("adult", "d")}
                        >
                          -
                        </button>
                        <span className="optionCounterNumber">
                          {options.adult}
                        </span>
                        <button
                          className="optionCounterButton"
                          onClick={() => handleOption("adult", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="optionItem">
                      <span className="optionText">Children</span>
                      <div className="optionCounter">
                        <button
                          disabled={options.children <= 0}
                          className="optionCounterButton"
                          onClick={() => handleOption("children", "d")}
                        >
                          -
                        </button>
                        <span className="optionCounterNumber">
                          {options.children}
                        </span>
                        <button
                          className="optionCounterButton"
                          onClick={() => handleOption("children", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="optionItem">
                      <span className="optionText">Room</span>
                      <div className="optionCounter">
                        <button
                          disabled={options.room <= 1}
                          className="optionCounterButton"
                          onClick={() => handleOption("room", "d")}
                        >
                          -
                        </button>
                        <span className="optionCounterNumber">
                          {options.room}
                        </span>
                        <button
                          className="optionCounterButton"
                          onClick={() => handleOption("room", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="headerSearchItem">
                <button className="headerBtn" onClick={handleSearch}>
                  Search
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
