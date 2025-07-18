import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Header } from "./components";
import { Home, Experiments } from "./pages";

const Layout = () => (
  <>
    <Header />
    <Outlet />
  </>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/experiments" element={<Experiments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
