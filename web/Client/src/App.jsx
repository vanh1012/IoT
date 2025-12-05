import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./app/auth/LoginPage";
import DashboardPage from "./app/dashboard/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardPage />} />        


      </Routes>
    </BrowserRouter>
  );
}

export default App;
