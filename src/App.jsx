import { Outlet } from "react-router-dom";
import Menu from "./layout/Menu.jsx";
import Footer from "./layout/Footer.jsx";

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
