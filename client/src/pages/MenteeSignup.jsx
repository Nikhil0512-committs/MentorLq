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
  const [photoFile, setPhotoFile] = useState(null);

  // Options
  const careerOptions = [
    "Frontend",
    "Backend",
    "Data Science",
    "Product Management",
    "Marketing"
  ];

  const mentorshipOptions = [
    "Resume Review",
    "System Design",
    "DSA / Coding",
    "Career Guidance",
    "Interview Prep"
  ];

  const [selectedCareer, setSelectedCareer] = useState([]);
  const [selectedMentorship, setSelectedMentorship] = useState([]);

  const toggleCareer = (item) => {
    if (selectedCareer.includes(item)) {
      setSelectedCareer(selectedCareer.filter((x) => x !== item));
    } else if (selectedCareer.length < 2) {
      setSelectedCareer([...selectedCareer, item]);
    }
  };

  const toggleMentorship = (item) => {
    if (selectedMentorship.includes(item)) {
      setSelectedMentorship(selectedMentorship.filter((x) => x !== item));
    } else if (selectedMentorship.length < 2) {
      setSelectedMentorship([...selectedMentorship, item]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("password", password);
      fd.append("college", college);
      fd.append("mbaSpecialization", mbaSpecialization);
    // correct array sending
selectedCareer.forEach(item => fd.append("careerInterest", item));
selectedMentorship.forEach(item => fd.append("mentorshipAreas", item));

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
        <h2 className="text-2xl font-semibold text-center mb-3">Create Your Mentee Account</h2>
        <p className="text-gray-600 text-center mb-6">
          Let mentors understand your background better
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Upload Photo */}
          <div>
            <label className="font-medium text-gray-700 mb-1 block">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files[0])}
              className="block w-full text-sm"
            />
          </div>

          {/* Text Fields */}
          <input className="signup-input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="signup-input" placeholder="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="signup-input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className="signup-input" placeholder="College Name" value={college} onChange={(e) => setCollege(e.target.value)} />
          <input className="signup-input" placeholder="Year/Specialization" value={mbaSpecialization} onChange={(e) => setMbaSpecialization(e.target.value)} />
          <input className="signup-input" placeholder="10-digit Mobile Number" value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} />
          <input className="signup-input" placeholder="LinkedIn Profile URL" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} />

         {/* Career Interests */}
<div>
  <label className="font-medium text-gray-800 text-sm">Career Interests *</label>
  <p className="text-xs text-gray-500 mb-2">
    Select up to <strong>2 areas</strong> of interest for your career after your MBA.
  </p>

  <div className="grid grid-cols-2 gap-3">
    {careerOptions.map((item) => (
      <label
        key={item}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <input
          type="checkbox"
          className="w-4 h-4 text-blue-600"
          checked={selectedCareer.includes(item)}
          onChange={() => toggleCareer(item)}
          disabled={
            !selectedCareer.includes(item) &&
            selectedCareer.length >= 2
          }
        />
        <span className="text-gray-700">{item}</span>
      </label>
    ))}
  </div>
</div>

{/* Mentorship Areas */}
<div className="mt-5">
  <label className="font-medium text-gray-800 text-sm">Skills to Offer *</label>
  <p className="text-xs text-gray-500 mb-2">
    Select up to <strong>2 areas</strong> where you can help your juniors.
  </p>

  <div className="grid grid-cols-2 gap-3">
    {mentorshipOptions.map((item) => (
      <label
        key={item}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <input
          type="checkbox"
          className="w-4 h-4 text-blue-600"
          checked={selectedMentorship.includes(item)}
          onChange={() => toggleMentorship(item)}
          disabled={
            !selectedMentorship.includes(item) &&
            selectedMentorship.length >= 2
          }
        />
        <span className="text-gray-700">{item}</span>
      </label>
    ))}
  </div>
</div>

          <textarea
            placeholder="Short Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="signup-input"
          />

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

/* Add these global styles into index.css:
-------------------------------------------
.signup-input {
  @apply w-full p-3 border rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none;
}

.chip {
  @apply px-3 py-2 rounded-full border bg-gray-100 text-sm cursor-pointer transition;
}

.chip-selected {
  @apply bg-blue-600 text-white border-blue-600;
}
-------------------------------------------
*/
