import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import Contact from "./pages/contact/Contact.jsx";
import Home from "./pages/home/Home";
import Hotel from "./pages/hotel/Hotel";
import List from "./pages/list/List";
import Login from "./pages/login/Login";
import NewReview from "./pages/newReview/NewReview.jsx";
import HolidayOffers from "./pages/offers/holidayOffers";
import AvailableCitiesPage from "./pages/offers/AvailableCitiesPage.jsx";
import CityHotelsPage from "./pages/offers/CityHotelsPage.jsx"
import NoOffers from "./pages/offers/noOffers.jsx"

import Pay from "./pages/pay/Pay.jsx";
import Profile from "./pages/profile/Profile";
import Register from "./pages/register/register.jsx";
import Tlist from "./pages/tlist/Tlist.jsx";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/hotels" element={<List/>}/>
        <Route path="/hotels/:id" element={<Hotel/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/new-review" element={<NewReview/>}/>
        <Route path="/offers" element={<HolidayOffers/>}/>
        <Route path="/available-cities" element={<AvailableCitiesPage/>}/>
        <Route path="/city-hotels" element={<CityHotelsPage/>}/>
        <Route path="/no-offers" element={<NoOffers/>}/>
        <Route path="/pay" element={<Pay/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/hotelsbytype" element={<Tlist/>}/>
        

      </Routes>
    </BrowserRouter>
  );
}

export default App;
