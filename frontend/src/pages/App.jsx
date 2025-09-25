import { Outlet } from "react-router-dom";
import Menu from "../components/Menu.jsx";
import Footer from "../components/Footer.jsx";
import '../css/App.css';

const App = () => {
  return (
    <div className="app-container">
      <Menu />
      <main className="app-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
