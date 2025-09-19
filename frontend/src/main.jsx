import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const rootElement = document.getElementById("root");

// Make sure the element exists before rendering
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
