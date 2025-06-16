import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row">
        {/* Logo and branding section */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 md:w-2/5 flex flex-col justify-center items-center">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-2">
              Learn<span className="text-yellow-300">ly</span>
            </h1>
            <p className="text-indigo-200 text-lg">Your Interactive Learning Journey</p>
          </div>
          
          <div className="space-y-6 w-full max-w-xs">
            <div className="bg-white bg-opacity-15 hover:bg-opacity-20 transition-all duration-300 p-4 rounded-lg flex items-center shadow-md">
              <div className="bg-indigo-400 bg-opacity-30 rounded-full p-3 mr-4">
                <span className="text-xl">📚</span>
              </div>
              <span className="text-black font-medium">Access Course Materials</span>
            </div>
            
            <div className="bg-white bg-opacity-15 hover:bg-opacity-20 transition-all duration-300 p-4 rounded-lg flex items-center shadow-md">
              <div className="bg-purple-400 bg-opacity-30 rounded-full p-3 mr-4">
                <span className="text-xl">✍️</span>
              </div>
              <span className="text-black font-medium">Take Interactive Quizzes</span>
            </div>
            
            <div className="bg-white bg-opacity-15 hover:bg-opacity-20 transition-all duration-300 p-4 rounded-lg flex items-center shadow-md">
              <div className="bg-blue-400 bg-opacity-30 rounded-full p-3 mr-4">
                <span className="text-xl">📊</span>
              </div>
              <span className="text-black font-medium">Track Your Progress</span>
            </div>
          </div>
        </div>

        {/* Login form section */}
        <div className="p-8 md:w-3/5">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back, Student!</h2>
            <p className="text-gray-600 mb-8">Access your personalized learning experience</p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className={`relative rounded-md shadow-sm transition duration-200 ${
                  activeField === "username" ? "ring-2 ring-indigo-500" : ""
                }`}>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="block w-full px-4 py-3 rounded-md border-gray-300 focus:outline-none sm:text-sm"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setActiveField("username")}
                    onBlur={() => setActiveField("")}
                  />
                  <div className={`absolute bottom-0 left-0 h-0.5 bg-indigo-600 transition-all duration-300 ${
                    activeField === "username" ? "w-full" : "w-0"
                  }`}></div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className={`relative rounded-md shadow-sm transition duration-200 ${
                  activeField === "password" ? "ring-2 ring-indigo-500" : ""
                }`}>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full px-4 py-3 rounded-md border-gray-300 focus:outline-none sm:text-sm"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setActiveField("password")}
                    onBlur={() => setActiveField("")}
                  />
                  <div className={`absolute bottom-0 left-0 h-0.5 bg-indigo-600 transition-all duration-300 ${
                    activeField === "password" ? "w-full" : "w-0"
                  }`}></div>
                </div>
              </div>

              {showError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Are you a teacher?{" "}
                <a href="/teacher-login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Login as Teacher
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;