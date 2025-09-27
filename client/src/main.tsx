import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle TronLink extension errors to prevent them from disrupting the app
window.addEventListener('error', (event) => {
  if (event.error?.stack?.includes('chrome-extension://') && 
      event.error?.message?.includes('tronlinkParams')) {
    console.warn('TronLink extension error suppressed:', event.error.message);
    event.preventDefault();
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.stack?.includes('chrome-extension://') && 
      event.reason?.message?.includes('tronlinkParams')) {
    console.warn('TronLink extension rejection suppressed:', event.reason.message);
    event.preventDefault();
    return false;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
