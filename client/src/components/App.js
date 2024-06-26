import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext.js";
import ProtectedRoute from "./utils/ProtectedRoute";

import jwt_decode from "jwt-decode";

import NotFound from "./pages/NotFound.js";
import Skeleton from "./pages/Skeleton.js";
import Home from "./pages/Home.js";
import Closet from "./pages/Closet.js";
import UploadClothingArticle from "./pages/UploadClothingArticle.js";
import EditClothingArticle from "./pages/EditClothingArticle.js";
import Settings from "./pages/Settings.js";
import Welcome from "./pages/Welcome.js";
import Declutter from "./pages/Declutter.js";

import "../utilities.css";
import "./App.css";

import { get, post } from "../utilities";

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);
  const { dispatch } = useAuth();
  const [declutterClothes, setDeclutterClothes] = useState([]);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        setUserId(user._id);
        dispatch({ type: "LOGIN", payload: user._id });
      }
    });
  }, []);

  useEffect(() => {
    get("/api/declutterClothes", { userId: userId }).then((data) => {
      setDeclutterClothes(data);
    });
  }, [userId]);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user._id);
      dispatch({ type: "LOGIN", payload: user._id });
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <div className="App-container">
      <Routes>
        <Route
          path="/"
          element={
            <Skeleton
              path="/"
              handleLogin={handleLogin}
              handleLogout={handleLogout}
              userId={userId}
            />
          }
        />
        <Route
          path="welcome"
          element={
            <ProtectedRoute>
              <Welcome userId={userId} />
            </ProtectedRoute>
          }
        />
        <Route
          path="home"
          element={
            <ProtectedRoute>
              <Home handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="closet"
          element={
            <ProtectedRoute>
              <Closet userId={userId} declutterClothes={declutterClothes} />
            </ProtectedRoute>
          }
        />
        <Route
          path="closet/:clothingType"
          element={
            <ProtectedRoute>
              <Closet userId={userId} />
            </ProtectedRoute>
          }
        />
        <Route
          path="new"
          element={
            <ProtectedRoute>
              <UploadClothingArticle userId={userId} />
            </ProtectedRoute>
          }
        />
        <Route
          path="new/:clothingType"
          element={
            <ProtectedRoute>
              <UploadClothingArticle userId={userId} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:clothingType/:newArticle/:clothingIds"
          element={
            <ProtectedRoute>
              <EditClothingArticle userId={userId} />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <Settings handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings/:status"
          element={
            <ProtectedRoute>
              <Settings handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="declutter"
          element={
            <ProtectedRoute>
              <Declutter userId={userId} declutterClothes={declutterClothes} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
