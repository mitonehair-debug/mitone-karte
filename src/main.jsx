import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Checkin from "./Checkin.jsx";

const path = window.location.pathname;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {path === "/checkin" ? <Checkin /> : <App />}
  </React.StrictMode>
);
