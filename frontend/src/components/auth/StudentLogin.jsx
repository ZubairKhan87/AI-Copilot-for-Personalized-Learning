import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import "./Login.css"
const StudentLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeField, setActiveField] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setShowError(false);

    if (!username || !password) {
      setError("Please fill in all fields");
      setShowError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/authentication/student/",
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.error) {
        setError(response.data.error);
        setShowError(true);
      } else if (response.data.access) {
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
        localStorage.setItem("userType", "student");
        navigate("/student-dashboard");
      }
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 400:
            setError("Please provide both username and password");
            break;
          case 401:
            setError(err.response.data.error || "Invalid username or password");
            break;
          case 403:
            setError("Please use the correct credientals");
            break;
          default:
            setError("An error occurred during login");
        }
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("An error occurred during login");
      }
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`login-page ${mounted ? "fade-in" : ""}`}>
      <div className="floating-shapes">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="shape"></div>
        ))}
      </div>

      <div className="login-container">
        <div className="logo-section">
          <h1 className="brand">
            Learn<span className="highlight">ly</span>
          </h1>
          <p className="tagline">Your Interactive Learning Journey</p>
        </div>

        <div className="form-container">
          <h2 className="welcome-text">Welcome Back, Student!</h2>
          <p className="sub-text">Access your personalized learning experience</p>

          <form onSubmit={handleLogin} className="login-form">
          <label className="label" htmlFor="username">Username</label>

            <div className={`input-group ${activeField === "username" ? "focused" : ""}`}>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setActiveField("username")}
                onBlur={() => setActiveField("")}
                placeholder="Username"
                required
              />
              <div className="input-highlight"></div>
            </div>
            <label className="label" htmlFor="password">Password</label>

            <div className={`input-group ${activeField === "password" ? "focused" : ""}`}>

              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setActiveField("password")}
                onBlur={() => setActiveField("")}
                placeholder="Password"
                required
              />
              <div className="input-highlight"></div>
            </div>

            {showError && (
              <div className="error-message">
                <span className="error-icon">!</span>
                {error}
              </div>
            )}

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div className="switch-user">
            <p>Are you a teacher? <a href="/teacher-login">Login as Teacher</a></p>
          </div>

          <div className="features">
            <div className="feature">
              <div className="feature-icon">📚</div>
              <span>Access Course Materials</span>
            </div>
            <div className="feature">
              <div className="feature-icon">✍️</div>
              <span>Take Interactive Quizzes</span>
            </div>
            <div className="feature">
              <div className="feature-icon">📊</div>
              <span>Track Your Progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;