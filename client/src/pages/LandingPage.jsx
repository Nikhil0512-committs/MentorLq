import React from 'react'


export default function LandingPage(){
return (
<section className="py-16">
<div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
<div className="md:w-1/2">
<h1 className="text-4xl font-bold mb-4">MentorLinq — Learn from experts</h1>
<p className="text-gray-600 mb-6">Connect with mentors, book sessions, and grow your career.</p>
<div className="flex gap-3">
<a href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded">Get Started</a>
<a href="/home" className="px-4 py-2 border rounded">Explore</a>
</div>
</div>
<div className="md:w-1/2">
<div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">Hero image placeholder</div>
</div>
</div>
{/* HOW IT WORKS SECTION */}
<section className="py-20 bg-gray-50">
  <div className="max-w-6xl mx-auto px-4">
    {/* Title */}
    <h2 className="text-3xl font-semibold text-center text-gray-800 mb-12">
      How MentorLinQ Works
    </h2>

    {/* Steps */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">

      {/* Step 1 */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-2xl font-semibold">
          1
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-800">
          Create Your Profile
        </h3>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Sign up and build your profile. Tell us about your goals and what you're looking for in a mentor.
        </p>
      </div>

      {/* Step 2 */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-2xl font-semibold">
          2
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-800">
          Discover Mentors
        </h3>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Browse our curated list of mentors. Filter by industry, company, or
          skills to find your perfect match.
        </p>
      </div>

      {/* Step 3 */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-2xl font-semibold">
          3
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-800">
          Connect and Grow
        </h3>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Reach out to mentors, schedule sessions, and start your journey
          towards career success.
        </p>
      </div>

    </div>
  </div>
</section>

</section>

)
}