import React from 'react'
import { Link } from 'react-router-dom'


export default function Navbar(){
return (
<nav className="w-full bg-white shadow">
<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
<Link to="/" className="font-bold text-xl">MentorLinq</Link>
<div className="space-x-4 hidden md:flex">
<Link to="/" className="text-gray-600">Home</Link>
<Link to="/" className="text-gray-600">About</Link>
<Link to="/login" className="text-blue-600 font-medium">Login</Link>
</div>
<div className="md:hidden">
{/* Add mobile menu icon later */}
</div>
</div>
</nav>
)
}