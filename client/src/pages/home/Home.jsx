import Featured from "../../components/featured/Featured";
import FeaturedProperties from "../../components/featuredProperties/FeaturedProperties";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Navbar from "../../components/navbar/Navbar";
import PropertyList from "../../components/propertyList/PropertyList";
//import { AuthContext } from "../../context/AuthContext";
import "./home.css";

const Home = () => {
  //const { user } = useContext(AuthContext);
  
    
  return (
    <div>
      <Navbar />
      <Header/>
      <div className="homeContainer">
      <h1 className="homeTitle">Most popular cities</h1>
        <Featured/>
        <h1 className="homeTitle">Top-rated hotels</h1>
        <PropertyList/>
        <h1 className="homeTitle"> Popular searches</h1>
        <FeaturedProperties/>
        <MailList/>
        <Footer/>
      </div>
    </div>
  );
};

export default Home;
