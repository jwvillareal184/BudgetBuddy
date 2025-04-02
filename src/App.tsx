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
import ResetPass from "./ResetPass";

function App() {
  const { isLoggedIn } = useUser();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/request-new-password" element={<RequestNewPassword />} />
        <Route path="/reset-password" element={<ResetPass />} />
        {isLoggedIn ? (
          <>
            <Route path="/dashboard" element={<><Navigation /><Dashboard /></>} />
            <Route path="/expense" element={<><Navigation /><Expense /></>} />
            <Route path="/income" element={<><Navigation /><Income /></>} />
            <Route path="/goal" element={<><Navigation /><Goal /></>} />
            <Route path="/profile" element={<><Navigation /><Profile /></>} />
            <Route path="/change-password" element={<><Navigation /><ChangePassword /></>} />
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
