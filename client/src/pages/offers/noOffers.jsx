import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";

const NoOffers = () => {
    return (
        <>
        <Navbar />
              <Header type="list" />
              <div className="container" style={{ textAlign: 'center', padding: '50px 0' }}>
                <h2>No Offers Available</h2>
                <p>Sorry, there are no offers available for your selection at this time. Please check back later!</p>
                <button className="back-button" onClick={() => window.history.back()}>Go Back</button>
              </div>
              <div className="End_Page">
                <MailList />
                <Footer />
              </div>
        </>
    )
}
export default NoOffers;