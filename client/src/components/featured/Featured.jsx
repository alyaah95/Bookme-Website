import React, { useContext, useState } from "react";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { useNavigate } from "react-router-dom";
import { SearchContext } from "../../context/SearchContext";
import useFetch from "../../hooks/useFetch";
import "./featured.css";

const Featured = () => {
  const { data, loading } = useFetch(
    "/hotels/countByCity?cities=Rome,Beirut,Dahab"
  );
  const [dates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [options] = useState({
    adult: 1,
    children: 0,
    room: 1,
  });
  const { dispatch } = useContext(SearchContext);
  
  const navigate = useNavigate();

  const handleClick = (city) => {
    const destination = city;
    dispatch({ type: "NEW_SEARCH", payload: { destination, dates, options } });
    navigate("/hotels", { state: { destination, dates, options } });
  };

  return (
    <div className="featured">
      {loading ? (
        "Loading please wait"
      ) : (
        <>
          <div className="featuredItem" onClick={() => handleClick('Rome')}>
            <img  
              src="https://i.pinimg.com/736x/37/9a/b5/379ab510798c0e6928fbce586e3d90f4.jpg"
              alt=""
              className="featuredImg"
            />
            <div className="featuredTitles">
              <h1>Rome</h1>
              <h2 style={{color:"white"}}>{data[0]} properties</h2>
            </div>
          </div>

          <div className="featuredItem" onClick={() => handleClick('Beirut')}>
            <img
              src="https://i.pinimg.com/736x/e9/45/26/e9452624f45ef10ccdfa4944d8921137.jpg"
              alt=""
              className="featuredImg"
            />
            <div className="featuredTitles">
              <h1>Beirut</h1>
              <h2 style={{color:"white"}}>{data[1]} properties</h2>
            </div>
          </div>

          <div className="featuredItem" onClick={() => handleClick('Dahab')}>
            <img
              src="https://i.pinimg.com/736x/53/96/f9/5396f9f4ba2e4f0778e7aadf607d408c.jpg"
              alt=""
              className="featuredImg"
            />
            <div className="featuredTitles">
              <h1>Dahab</h1>
              <h2 style={{color:"white"}}>{data[2]} properties</h2>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Featured;
