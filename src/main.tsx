import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/theme.css";
import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element with id "root" not found in index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
