import { format } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-date-range";
import { useLocation } from "react-router-dom";
import Header from "../../components/header/Header";
import Navbar from "../../components/navbar/Navbar";
import SearchItem from "../../components/searchItem/SearchItem";
import useFetch from "../../hooks/useFetch";
import "./list.css";

const List = () => {
  const location = useLocation();
  const [destination, setDestination] = useState(location.state.destination);
  const [dates, setDates] = useState(location.state.dates);
  const [openDate, setOpenDate] = useState(false);
  const [options, setOptions] = useState(location.state.options);
  const [min, setMin] = useState(undefined);
  const [max, setMax] = useState(undefined);
  /*const [hasSearched, setHasSearched] = useState(true);*/

  const formatCityName = (value) => {
    const trimmedValue = value.trim();
    return trimmedValue
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleOptionChange = (name, value) => {
    setOptions((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0, // تحويل القيمة لرقم والتأكد إنها مش هتكون NaN لو فاضية
    }));
  };
  const { data, loading, reFetch } = useFetch(
    `/hotels?city=${formatCityName(destination)}&min=${min || 0}&max=${
      max || 999
    }`
  );

  const handleClick = () => {
    setDestination(formatCityName(destination));
    reFetch();
  };

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="listContainer">
        <div className="listWrapper">
          <div className="listSearch">
            <h1 className="lsTitle">Search</h1>
            <div className="lsItem">
              <label>Destination</label>
              <input
                placeholder={destination}
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="lsItem">
              <label>Check-in Date</label>
              <span onClick={() => setOpenDate(!openDate)}>{`${format(
                dates[0].startDate,
                "MM/dd/yyyy"
              )} to ${format(dates[0].endDate, "MM/dd/yyyy")}`}</span>
              {openDate && (
                <DateRange
                  onChange={(item) => setDates([item.selection])}
                  minDate={new Date()}
                  ranges={dates}
                />
              )}
            </div>
            <div className="lsItem">
              <label>Options</label>
              <div className="lsOptions">
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Min price <small>per night</small>
                  </span>
                  <input
                    type="number"
                    min={0}
                    onChange={(e) =>
                      setMin(e.target.value < 0 ? 0 : e.target.value)
                    }
                    className="lsOptionInput"
                    value={min || ""}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Max price <small>per night</small>
                  </span>
                  <input
                    type="number"
                    min={0}
                    onChange={(e) =>
                      setMax(e.target.value < 0 ? 0 : e.target.value)
                    }
                    className="lsOptionInput"
                    value={max || ""}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Adult</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    placeholder={options.adult}
                    value={options.adult}
                    onChange={(e) =>
                      handleOptionChange("adult", e.target.value)
                    }
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Children</span>
                  <input
                    type="number"
                    min={0}
                    className="lsOptionInput"
                    placeholder={options.children}
                    value={options.children}
                    onChange={(e) =>
                      handleOptionChange("children", e.target.value)
                    }
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Room</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    placeholder={options.room}
                    value={options.room}
                    onChange={(e) => handleOptionChange("room", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <button onClick={handleClick}>Search</button>
          </div>
          <div className="listResult">
            {loading ? (
              "loading"
            ) : (
              <>
                {data && data.length > 0 ? (
                  // لو فيه بيانات ورجعت فنادق (طول المصفوفة أكبر من صفر)
                  data.map((item) => <SearchItem item={item} key={item._id} />)
                ) : (
                  // لو مفيش بيانات أو المصفوفة فاضية (يعني مفيش نتائج)
                  <div className="noResultsMessage">
                    <h2>No hotels found for "{destination}"</h2>
                    <p>
                      Please try a different destination or adjust your search
                      criteria.
                    </p>
                    <p>
                      You can also explore our{" "}
                      <a href="/offers">Offers & Inspiration</a> section!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;
