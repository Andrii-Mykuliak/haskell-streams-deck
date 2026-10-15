import { createRoot } from "react-dom/client";
import App from "./App";

document.body.style.margin = "0";
document.body.style.background = "#181c28";
document.body.style.overflow = "hidden";

createRoot(document.getElementById("root")!).render(<App />);
