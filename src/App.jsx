import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/home";
import Order from "./pages/order";
import Market from "./pages/market";
import Profile from "./pages/profile";
import BottomNav from "./components/BottomNav";
import { ThemeProvider } from "./contexts/ThemeContext";

function PageTransition({ children }) {
  return (
    <div
      style={{
        animation: "fadeIn 240ms ease",
      }}
    >
      {children}
    </div>
  );
}

function RouterWrapper() {
  const location = useLocation();
  return (
    <>
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/market" element={<Market />} />
          <Route path="/order" element={<Order />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </PageTransition>

      <BottomNav />
    </>
  );
}

// -----------------------------------------------------

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <RouterWrapper />
      </BrowserRouter>
    </ThemeProvider>
  );
}
