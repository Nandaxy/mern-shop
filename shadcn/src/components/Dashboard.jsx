import React from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import TesDashboard from "./Tes.jsx";

const Dashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const user = token ? jwtDecode(token) : null;

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
    };

    if (!user) {
        navigate("/login");
        return null;
    }

    console.log(user);

    return (
        <div>
            <h2>Dashboard</h2>
            <p>Welcome, {user.userId}!</p>
            <p>Welcome, {user.username}!</p>
            <button onClick={handleLogout}>Logout</button>
            <TesDashboard />
        </div>
    );
};

export default Dashboard;
