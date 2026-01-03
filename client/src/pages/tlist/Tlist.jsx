import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import Header from "../../components/header/Header";
import Navbar from "../../components/navbar/Navbar";
import SearchItem from "../../components/searchItem/SearchItem";
import useFetch from "../../hooks/useFetch";
import "./tlist.css";

const Tlist = () => {
  const location = useLocation();
  const [type] =useState(location.state.type);
  const { data, loading } = useFetch(
    `/hotels/type/${type}`
  );

  return (
    <div>
      <Navbar/>
      <Header type="list" />
      <div className="listContainer">
        <div className="listWrapper">
          <div className="listResult">
          {loading ? (
              "loading"
            ) : (
              <>
                {data.map((item) => (
                  <SearchItem item={item} key={item._id} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tlist;
