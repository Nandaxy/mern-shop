import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Header from "./components/layout/Header";
import { jwtDecode } from "jwt-decode";
import { refreshToken } from "./lib/auth";

const App = () => {
    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("accessToken")
    );

    useEffect(() => {
        const interval = setInterval(
            async () => {
                const refreshTokenValue = localStorage.getItem("refreshToken");
                if (refreshTokenValue) {
                    try {
                        const { data } = await refreshToken({
                            token: refreshTokenValue
                        });
                        localStorage.setItem("accessToken", data.accessToken);
                        setAccessToken(data.accessToken);
                    } catch (error) {
                        console.error(error);
                    }
                }
            },
            14 * 60 * 1000
        ); // Refresh token every 14 minutes

        return () => clearInterval(interval);
    }, []);

    const decodedToken = accessToken ? jwtDecode(accessToken) : null;
    const isTokenExpired = decodedToken
        ? decodedToken.exp * 1000 < Date.now()
        : true;

    return (
        <div className="min-h-screen">
            <Header />
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route
                    path="/login"
                    element={<Login setAccessToken={setAccessToken} />}
                />
                <Route
                    path="/dashboard"
                    element={
                        !accessToken || isTokenExpired ? (
                            <Navigate to="/login" />
                        ) : (
                            <Dashboard />
                        )
                    }
                />
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </div>
    );
};

export default App;
