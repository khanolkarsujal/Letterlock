import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// The root div is guaranteed to exist (created in index.html)
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = document.getElementById("root")!; // safe because index.html always renders it

ReactDOM.createRoot(root).render(<App />);
