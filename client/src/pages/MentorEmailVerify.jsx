import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";

export default function MentorEmailVerify() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Handle single digit change
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return; // allow only numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // Handle paste full OTP
  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").trim();

    if (!/^[0-9]{6}$/.test(pasteData)) return;

    const newOtp = pasteData.split("");
    setOtp(newOtp);

    // auto-focus last box
    inputsRef.current[5].focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalOtp = otp.join("");

    try {
      const res = await api.post("/api/auth/mentor/verify-account", {
        otp: finalOtp,
      });

      if (res.data.success) {
        navigate("/mentor/dashboard");
      } else {
        alert(res.data.message || "Invalid OTP");
      }
    } catch (error) {
      alert("Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-2">
          Verify Your Mentor Account
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Enter the 6-digit OTP sent to your email
        </p>

        <form onSubmit={handleVerify} className="space-y-5">
          {/* OTP boxes */}
          <div className="flex justify-between gap-2 sm:gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-10 h-12 sm:w-12 sm:h-14 border rounded-lg text-center text-lg sm:text-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Verifying..." : "Verify Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
