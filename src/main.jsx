import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PropertyProvider } from "./context/PropertyContext";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>

    <LanguageProvider>

      <ThemeProvider>

        <PropertyProvider>

          <App />

        </PropertyProvider>

      </ThemeProvider>

    </LanguageProvider>

  </React.StrictMode>
);