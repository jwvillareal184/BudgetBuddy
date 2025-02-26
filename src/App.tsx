import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./UserContext";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import Expense from "./Expense";
import Income from "./Income";
import Navigation from "./Navigation";
import Goal from "./Goal";
import Profile from "./Profile";
import ChangePassword from "./ChangePassword";
import SignUp from "./SignUp";
import RequestNewPassword from "./RequestNewPassword";

function App() {
  const {isLoggedIn } = useUser();

  return (
    <Router>
      {isLoggedIn && <Navigation />}
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/request-new-password" element={<RequestNewPassword />} />
        {isLoggedIn ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expense" element={<Expense />} />
            <Route path="/income" element={<Income />} />
            <Route path="/goal" element={<Goal />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
