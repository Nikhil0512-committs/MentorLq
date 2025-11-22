// src/pages/LandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

/**
 * LandingPage.jsx
 *
 * NOTE:
 * - UI/structure preserved exactly as requested.
 * - I only added element IDs and smooth-scrolling handlers so the navbar buttons scroll to sections:
 *    - "Our Mentors" -> Everything You Need to Succeed (id="mentors")
 *    - "How it works" -> How it Works (id="how-it-works")
 *    - "Pricing" -> Pricing (id="pricing")
 *    - "About Us" -> Built by Students (id="about")
 *
 * - Additionally the mobile drawer buttons perform the same scrolling.
 * - The hero image source uses a local uploaded path (see HERO_IMG_PATH constant) so you can transform it into a URL in your environment if needed.
 *
 * - No UI styling, text, or layout were changed beyond adding IDs and JS scroll behavior.
 */

/* Developer note / asset path:
   The uploaded hero illustration file path available in the conversation is:
   /mnt/data/1bb2a64e-4805-4c85-a620-b220e5f64b3d.png
   I use it below as HERO_IMG_PATH so you (or your build) can map/transform a local path to a served URL.
*/
const HERO_IMG_PATH = "/mnt/data/1bb2a64e-4805-4c85-a620-b220e5f64b3d.png";

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    // small helper for smooth scrolling. If target not present, do nothing.
    try {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (e) {
      // silent - preserve UI behavior
      // console.warn("Scroll failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900 font-inter">

      {/* ─────────────────────── NAVBAR ─────────────────────── */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left Section: Logo + Menu */}
            <div className="flex items-center gap-6">

              {/* Logo */}
              <div
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => navigate("/")}
              >
                <span className="font-bold text-lg tracking-tight">MentorLinq</span>
              </div>

              {/* Desktop Menu */}
              <nav className="hidden md:flex items-center gap-6 ml-2 text-[15px]">
                {[
                  { label: "Our Mentors", id: "mentors" },
                  { label: "How it works", id: "how-it-works" },
                  { label: "Pricing", id: "pricing" },
                  { label: "About Us", id: "about" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => scrollTo(item.id)}
                    className="px-3 py-1 rounded-md hover:bg-blue-50 transition cursor-pointer text-gray-600 hover:text-blue-600"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">

              {/* Login Desktop */}
              <button
                onClick={() => navigate("/login")}
                className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-blue-600 hover:text-white transition font-medium cursor-pointer"
              >
                Login / Sign Up
              </button>

              {/* Mobile Menu Button */}
              <button
                aria-label="open menu"
                className="md:hidden p-2 rounded-md border border-gray-200 hover:bg-gray-100"
                onClick={() =>
                  document.getElementById("mobile-drawer")?.classList.toggle("hidden")
                }
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="#6b7280" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div id="mobile-drawer" className="hidden md:hidden border-t border-gray-100">
          <div className="px-4 py-3 space-y-2">
            <button
              className="w-full text-left py-2 hover:bg-gray-50 rounded text-gray-700"
              onClick={() => { document.getElementById("mobile-drawer")?.classList.toggle("hidden"); scrollTo("mentors"); }}
            >
              Our Mentors
            </button>
            <button
              className="w-full text-left py-2 hover:bg-gray-50 rounded text-gray-700"
              onClick={() => { document.getElementById("mobile-drawer")?.classList.toggle("hidden"); scrollTo("how-it-works"); }}
            >
              How it works
            </button>
            <button
              className="w-full text-left py-2 hover:bg-gray-50 rounded text-gray-700"
              onClick={() => { document.getElementById("mobile-drawer")?.classList.toggle("hidden"); scrollTo("pricing"); }}
            >
              Pricing
            </button>
            <button
              className="w-full text-left py-2 hover:bg-gray-50 rounded text-gray-700"
              onClick={() => { document.getElementById("mobile-drawer")?.classList.toggle("hidden"); scrollTo("about"); }}
            >
              About Us
            </button>
            <button
              className="w-full text-left py-2 hover:bg-gray-50 rounded text-gray-700"
              onClick={() => { document.getElementById("mobile-drawer")?.classList.toggle("hidden"); navigate("/login"); }}
            >
              Login / Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────── HERO SECTION ─────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

          {/* Text */}
          <div className="md:col-span-7">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold leading-tight tracking-tight text-gray-900">
              Find Your Right Mentor.
              <span className="block">Unlock your Potential.</span>
            </h1>

            <p className="mt-4 text-lg text-gray-600 max-w-xl leading-relaxed">
              MentorLinq connects juniors with senior mentors from their colleges for placement prep, resume help, mock interviews & career guidance — 1-on-1 mentorship built for students.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/signup/mentee")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow font-semibold transition"
              >
                Get Started
              </button>

              <button
                onClick={() => navigate("/signup/mentee")}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition"
              >
                Browse mentors
              </button>
            </div>

            {/* Beta Tag */}
            <div className="mt-6">
              <div className="inline-flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm shadow-sm">
                <span className="text-xl">🚀</span>
                <div className="leading-tight">
                  <div className="font-semibold">We are currently in Beta!</div>
                  <div className="text-xs">All mentorship features are FREE while we refine the platform.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl bg-white p-6">
              <img
                // use local upload path; transform to URL in your environment as needed
                src={assets?.HomeImg || HERO_IMG_PATH}
                alt="Mentorship Illustration"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* ─────────────────────── HOW IT WORKS ─────────────────────── */}
        <section id="how-it-works" className="mt-20 md:flex-col md:justify-between md:items-center md:flex gap-10 items-center">
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900">How it Works</h3>

            <ol className="mt-6 space-y-5 text-gray-700">
              {[
                ["Create Your Profile", "Tell us your goals & background so we can match you better."],
                ["Discover & Connect", "Find mentors who align with your needs using smart matching."],
                ["Book a Session", "Schedule personalised 1-on-1 sessions to move forward."]
              ].map(([title, desc], i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{title}</div>
                    <div className="text-sm text-gray-500">{desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─────────────────────── BUILT BY STUDENTS (UPDATED WITH 4 IMAGES) ─────────────────────── */}
        <section id="about" className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* TEXT */}
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900">
              Built by Students, for Students.
            </h3>
            <p className="mt-3 ml-3 text-gray-600 text-[15px] leading-relaxed">
              MentorLinq was born from real experiences navigating competitive placements.
              We created the bridge between classroom learning and real-world expectations.
            </p>
          </div>

          {/* 4-IMAGE GRID */}
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">

            {/* IMAGE 1 */}
            <div className="bg-white rounded-xl shadow p-3 flex justify-center">
              <img
                src={assets?.Build1}
                alt="students illustration 1"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            {/* IMAGE 2 */}
            <div className="bg-white rounded-xl shadow p-3 flex justify-center">
              <img
                src={assets?.Build2}
                alt="students illustration 2"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            {/* IMAGE 3 */}
            <div className="bg-white rounded-xl shadow p-3 flex justify-center">
              <img
                src={assets?.Build3}
                alt="students illustration 3"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            {/* IMAGE 4 */}
            <div className="bg-white rounded-xl shadow p-3 flex justify-center">
              <img
                src={assets?.Build4}
                alt="students illustration 4"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

          </div>
        </section>

        {/* EVERYTHING YOU NEED TO SUCCEED – THIS SECTION IS THE TARGET FOR "Our Mentors" */}
        <section id="mentors" className="mt-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-500 text-center mt-2 text-sm md:text-base">
            Features designed to help you land your dream job and build a successful career.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* CARD 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition">
              <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl mb-4">
                ✨
              </div>
              <h4 className="font-semibold text-gray-900">Smart Mentor Discovery</h4>
              <p className="text-gray-500 text-sm mt-2">
                Our algorithm helps you find the perfect mentor based on your industry,
                goals and background.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition">
              <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl mb-4">
                📘
              </div>
              <h4 className="font-semibold text-gray-900">Resource Library</h4>
              <p className="mt-1 text-xs text-gray-500 flex items-center justify-center gap-1">
                ⏳ <span>Coming Soon</span>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Access a curated library of resume templates, case studies and interview guides.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition">
              <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl mb-4">
                ⭐
              </div>
              <h4 className="font-semibold text-gray-900">Ratings & Reviews</h4>
              <p className="mt-1 text-xs text-gray-500 flex items-center justify-center gap-1">
                ⏳ <span>Coming Soon</span>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Read authentic reviews from other students to choose your mentor with confidence.
              </p>
            </div>

            {/* CARD 4 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition">
              <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl mb-4">
                👍
              </div>
              <h4 className="font-semibold text-gray-900">Personalized Recommendations</h4>
              <p className="text-gray-500 text-sm mt-2">
                Get tailored suggestions for mentors and resources that match your
                progress and interests.
              </p>
            </div>

          </div>
        </section>

        {/* ─────────────────────── PRICING ─────────────────────── */}
        <section id="pricing" className="mt-24 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900">Simple, Transparent Pricing</h3>
          <p className="mt-3 text-gray-600">Early users get full free access while we are in beta.</p>

          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-10">
            <div className="bg-white border rounded-2xl shadow-lg p-8 w-full md:w-96 text-left">
              <div className="text-sm text-gray-500 uppercase font-semibold mb-2">
                Free Forever (Beta)
              </div>

              <div className="text-5xl font-extrabold text-gray-900">
                ₹0 <span className="text-lg font-medium text-gray-500">/ month</span>
              </div>

              <ul className="mt-6 space-y-3 text-gray-700 text-sm">
                <li>✓ Unlimited mentor browsing</li>
                <li>✓ 1-on-1 mentorship sessions</li>
                <li>✓ Resume & LinkedIn review</li>
                <li>✓ Placement preparation support</li>
                <li>✓ College senior mentors matched to you</li>
              </ul>

              <button
                onClick={() => navigate("/signup/mentee")}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-semibold"
              >
                Join For Free
              </button>
            </div>
          </div>
        </section>

        {/* ─────────────────────── FOOTER ─────────────────────── */}
        <footer className="mt-20 -mb-25 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* LEFT SECTION */}
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-lg">❤️</span>
                <span className="font-medium">Built with love for students</span>
              </div>

              {/* CENTER TEXT */}
              <div className="text-gray-500 text-sm">
                © 2025 MentorLinq. All rights reserved.
              </div>

              {/* RIGHT SECTION */}
              <button
                onClick={() => navigate("/contact")}
                className="text-gray-600 hover:text-blue-600 text-sm font-medium transition cursor-pointer"
              >
                Contact Us
              </button>
            </div>
          </div>
        </footer>

      </main>

    </div>
  );
}
