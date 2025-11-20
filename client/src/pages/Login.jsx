import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mentee");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* CARD */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        
        {/* Logo */}
        <div className="w-full flex justify-center mb-6">
          {/* Replace with your actual logo image */}
          <img 
            src="/yourLogo.png" 
            alt="MentorLinq" 
            className="h-10"
          />
        </div>

        {/* Title */}
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
          Log In
        </h2>

        {/* Toggle Buttons */}
        <div className="flex border-b mb-6">
          <button
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === "mentee"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("mentee")}
          >
            I'm a mentee
          </button>

          <button
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === "mentor"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("mentor")}
          >
            I'm a mentor
          </button>
        </div>

        {/* INPUTS */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-gray-700 text-sm">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-gray-700 text-sm">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full mt-6 bg-blue-600 text-white py-2.5 rounded-lg text-center font-semibold hover:bg-blue-700 transition"
        >
          Log In
        </button>

        {/* Footer Links */}
        <div className="text-center mt-5 text-sm text-gray-600">
          Don't have an account?
          <span
            onClick={() => navigate("/signup-mentee")}
            className="text-blue-600 cursor-pointer ml-1"
          >
            Sign up as a mentee
          </span>
          <br />
          or
          <span
            onClick={() => navigate("/signup-mentor")}
            className="text-blue-600 cursor-pointer ml-1"
          >
            Apply to be a mentor
          </span>
        </div>
      </div>
    </div>
  );
}
