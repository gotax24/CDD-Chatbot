import { Outlet } from "react-router-dom";
import Menu from "../components/Menu.jsx";
import Footer from "../components/Footer.jsx";

const App = () => {
  return (
    <>
      <Menu />
      <Outlet />
      <Footer />
    </>
  );
};

export default App;
