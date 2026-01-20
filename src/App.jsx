import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="app-container">
      <Toaster position="top-right"  reverseOrder={false}  toastOptions={{style: { zIndex: 9999 }}}/>
      <AppRoutes />
    </div>
  );
}

export default App;