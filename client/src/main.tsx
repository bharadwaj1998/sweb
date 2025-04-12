import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply theme
document.documentElement.classList.add('light');
document.documentElement.style.setProperty('--radius', '0.5rem');

createRoot(document.getElementById("root")!).render(<App />);
