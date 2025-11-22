// src/pages/Auth/MentorSignup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";

export default function MentorSignup() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [internshipComp, setInternshipComp] = useState("");
  const [bio, setBio] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [mobileNo, setMobileNo] = useState("");

  // Image Upload
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Options
  const skillOptions = ["Resume Review", "Mock Interviews", "Networking Strategy", "Valuation Techniques", "Marketing", ];
  const careerOptions = ["Human Resources", "Product Management", "Consulting", "Marketing", "Investment Banking", "Finance"];

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState([]);

  const toggleSkill = (item) => {
    if (selectedSkills.includes(item)) {
      setSelectedSkills(selectedSkills.filter((x) => x !== item));
    } else if (selectedSkills.length < 4) {
      setSelectedSkills([...selectedSkills, item]);
    }
  };

  const toggleCareer = (item) => {
    if (selectedCareer.includes(item)) {
      setSelectedCareer(selectedCareer.filter((x) => x !== item));
    } else if (selectedCareer.length < 4) {
      setSelectedCareer([...selectedCareer, item]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1) Register mentor
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("password", password);
      fd.append("specialization", specialization);
      fd.append("internshipComp", internshipComp);
      fd.append("bio", bio);
      fd.append("linkedIn", linkedIn);
      fd.append("mobileNo", mobileNo);

      selectedSkills.forEach((item) => fd.append("skills", item));
      selectedCareer.forEach((item) => fd.append("career", item));
      fd.append("photo", photoFile);

      const registerRes = await api.post("/api/auth/mentor/register", fd);

      if (!registerRes.data || !registerRes.data.success) {
        // registration failed
        alert(registerRes.data?.message || "Registration failed");
        setSubmitting(false);
        return;
      }

      // 2) Registration succeeded — backend should have set mentorToken cookie.
      // Now request OTP to be sent to mentor email.
      const otpRes = await api.post("/api/auth/mentor/send-verify-otp");

      if (!otpRes.data || !otpRes.data.success) {
        // OTP sending failed. Show message and don't redirect.
        alert(otpRes.data?.message || "Failed to send verification OTP. Try again.");
        setSubmitting(false);
        return;
      }

      // 3) OTP sent successfully -> redirect to verify page
      navigate("/mentor/email-verify");
    } catch (err) {
      console.error("mentor signup error:", err);
      alert("Signup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 py-10 px-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-semibold text-center mb-3">Create Your Mentor Account</h2>
        <p className="text-gray-600 text-center mb-6">
          Share your experience to help mentees grow
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

         {/* IMAGE UPLOAD – PREMIUM CLEAN UI */}
<div className="flex flex-col items-center mb-2">
  <label className="font-medium text-gray-700 text-sm mb-2">
    Profile Photo <span className="text-red-500">*</span>
  </label>

  <div className="relative group">
    <img
      src={preview || "/default-avatar.png"}
      alt="profile"
      className="w-32 h-32 rounded-full object-cover shadow-md border border-gray-200 transition-all"
    />

    {/* Floating upload button */}
    <label
      htmlFor="photo-upload"
      className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer 
                 hover:bg-blue-700 transition-all"
      title="Upload photo"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
        />
      </svg>
    </label>

    <input
      id="photo-upload"
      type="file"
      accept="image/jpeg,image/jpg"
      onChange={handleImageUpload}
      className="hidden"
    />
  </div>

  <p className="text-xs text-gray-500 mt-2">Only JPG / JPEG allowed</p>
</div>


          {/* INPUT FIELDS */}
          <div>
            <label className="font-medium text-gray-700 text-sm">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              className="signup-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700 text-sm">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              className="signup-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              type="email"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700 text-sm">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              className="signup-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              type="password"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700 text-sm">
              Specialization <span className="text-red-500">*</span>
            </label>
            <input
              className="signup-input"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. SDE, Product, AI"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700 text-sm">
              Internship / Company Name <span className="text-red-500">*</span>
            </label>
            <input
              className="signup-input"
              value={internshipComp}
              onChange={(e) => setInternshipComp(e.target.value)}
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700 text-sm">
              LinkedIn Profile URL <span className="text-red-500">*</span>
            </label>
            <input
              className="signup-input"
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700 text-sm">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              className="signup-input"
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
              placeholder="10 digit mobile number"
            />
          </div>

          {/* SKILLS */}
          <div>
            <label className="font-medium text-gray-800 text-sm">
              Skills to Offer (Max 4) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {skillOptions.map((item) => (
                <label key={item} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(item)}
                    onChange={() => toggleSkill(item)}
                    disabled={
                      !selectedSkills.includes(item) && selectedSkills.length >= 4
                    }
                    className="w-4 h-4"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* CAREER */}
          <div>
            <label className="font-medium text-gray-800 text-sm">
              Career Areas in which you can guide (Max 4) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {careerOptions.map((item) => (
                <label key={item} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCareer.includes(item)}
                    onChange={() => toggleCareer(item)}
                    disabled={
                      !selectedCareer.includes(item) && selectedCareer.length >= 4
                    }
                    className="w-4 h-4"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="font-medium text-gray-700 text-sm">
              Short Bio <span className="text-red-500">*</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell mentees about yourself"
              className="signup-input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {submitting ? "Submitting..." : "Create Mentor Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
