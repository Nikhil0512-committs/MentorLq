import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'


export default function Navbar(){
return (
<nav className="w-full bg-white shadow">
<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
    <img src={assets.MentorLinqLogobg} className="h-17 -m-3"/>
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