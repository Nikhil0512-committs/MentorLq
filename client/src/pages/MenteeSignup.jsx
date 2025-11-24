// src/pages/Auth/MenteeSignup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";

export default function MenteeSignup() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [mbaSpecialization, setMbaSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [mobileNo, setMobileNo] = useState("");

  // Image Upload
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Options
  const careerOptions = ["Consulting", "Investment Banking", "Fintech", "Product Management", "Marketing", "Healthcare", "E-Commerce", "Human Resources"];
  const mentorshipOptions = ["Resume Review", "Case Preparation", "GD Prep", "Networking Strategy", "Mock Interviews"];
  const [selectedCareer, setSelectedCareer] = useState([]);
  const [selectedMentorship, setSelectedMentorship] = useState([]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    // FIX START: Prevent upload if file is missing or too large
    if (!file) return;

    // AWS Nginx default limit is 1MB. We restrict it here to prevent 413 Error.
    if (file.size > 1 * 1024 * 1024) { 
      alert("File is too large! Please choose an image smaller than 1MB.");
      return; 
    }
    // FIX END

    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const toggleCareer = (item) => {
  setSelectedCareer((prev) => {
    if (prev.includes(item)) {
      return prev.filter((x) => x !== item); // remove
    }
    if (prev.length === 2) {
      return prev; // prevent selecting more than 2
    }
    return [...prev, item]; // add
  });
};


  const toggleMentorship = (item) => {
  setSelectedMentorship((prev) => {
    if (prev.includes(item)) {
      return prev.filter((x) => x !== item); // remove
    }
    if (prev.length === 2) {
      return prev; // prevent selecting more than 2
    }
    return [...prev, item]; // add
  });
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (selectedCareer.length < 1 || selectedMentorship.length < 1) {
         alert("Please select at least 1 option in both Career Interests and Mentorship Areas.");
         setSubmitting(false);
         return;
       }
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("password", password);
      fd.append("college", college);
      fd.append("mbaSpecialization", mbaSpecialization);

      selectedCareer.forEach((item) => fd.append("careerInterest", item));
      selectedMentorship.forEach((item) => fd.append("mentorshipAreas", item));

      fd.append("bio", bio);
      fd.append("linkedIn", linkedIn);
      fd.append("mobileNo", mobileNo);
      fd.append("file", photoFile);

      const res = await api.post("/api/auth/register", fd);
      if (res.data.success) {
        localStorage.setItem("pendingEmail", email);
        navigate("/email-verify");
      } else alert(res.data.message);
    } catch (e) {
      alert("Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 py-10 px-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-md p-8">
        {/* --- NEW: MENTOR SWITCH BUTTON --- */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => navigate("/signup/mentor")}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
          >
            Are you a Mentor? Apply here →
          </button>
        </div>
        {/* -------------------------------- */}
        <h2 className="text-2xl font-semibold text-center mb-3">Create Your Mentee Account</h2>
        <p className="text-gray-600 text-center mb-6">
          Let mentors understand your background better
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

        {/* IMAGE UPLOAD - CLEAN PREMIUM UI */}
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

    {/* Floating upload icon */}
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
      accept="image/*"
      onChange={handleImageUpload}
      className="hidden"
    />
  </div>

  <p className="text-xs text-gray-500 mt-2">
    Upload a clear professional-looking photo(should not be greater than 1 MB)
  </p>
</div>



          {/* FIELDS */}
          <div>
            <label className="font-medium text-gray-700 text-sm">Full Name <span className="text-red-500">*</span></label>
            <input className="signup-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
          </div>

          <div>
            <label className="font-medium text-gray-700 text-sm">Email Address <span className="text-red-500">*</span></label>
            <input className="signup-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
          </div>

          <div>
            <label className="font-medium text-gray-700 text-sm">Password <span className="text-red-500">*</span></label>
            <input className="signup-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
          </div>

          <div>
            <label className="font-medium text-gray-700 text-sm">College Name <span className="text-red-500">*</span></label>
            <input className="signup-input" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="Enter your college" />
          </div>

          <div>
            <label className="font-medium text-gray-700 text-sm">Specialization <span className="text-red-500">*</span></label>
            <input className="signup-input" value={mbaSpecialization} onChange={(e) => setMbaSpecialization(e.target.value)} placeholder="e.g. Marketing" />
          </div>

          <div>
            <label className="font-medium text-gray-700 text-sm">Mobile Number <span className="text-red-500">*</span></label>
            <input className="signup-input" value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} placeholder="10-digit mobile number" />
          </div>

          <div>
            <label className="font-medium text-gray-700 text-sm">LinkedIn Profile <span className="text-red-500">*</span></label>
            <input className="signup-input" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="Paste LinkedIn URL" />
          </div>

          {/* CAREER INTERESTS */}
          <div>
            <label className="font-medium text-gray-800 text-sm">Career Interests <span className="text-red-500">*</span></label>
            <p className="text-xs text-gray-500 mb-2">
              Select exactly <strong>2</strong> options.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {careerOptions.map((item) => (
                <label key={item} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600"
                    checked={selectedCareer.includes(item)}
                    onChange={() => toggleCareer(item)}
                    disabled={!selectedCareer.includes(item) && selectedCareer.length >= 2}
                  />
                  <span className="text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* MENTORSHIP AREAS */}
          <div>
            <label className="font-medium text-gray-800 text-sm">Help Needed in these sections <span className="text-red-500">*</span></label>
            <p className="text-xs text-gray-500 mb-2">
              Select exactly <strong>2</strong> options.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {mentorshipOptions.map((item) =>
                <label key={item} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600"
                    checked={selectedMentorship.includes(item)}
                    onChange={() => toggleMentorship(item)}
                    disabled={!selectedMentorship.includes(item) && selectedMentorship.length >= 2}
                  />
                  <span className="text-gray-700">{item}</span>
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="font-medium text-gray-700 text-sm">Short Bio <span className="text-red-500">*</span></label>
            <textarea className="signup-input" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell mentors about yourself" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {submitting ? "Submitting..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
