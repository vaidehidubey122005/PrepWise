import React from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/PrepWise_Hero.png";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-pink-50 font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-6">
        <div className="text-2xl font-bold text-blue-700">
          PrepWise
        </div>
        <div className="space-x-6">
          <Link to="/" className="text-gray-800 font-medium hover:underline">
            Home
          </Link>
          <Link to="/interview">
  <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
    Get Started
  </button>
</Link>



          <Link to="/register">
            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
              Register
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-12">
        <div className="max-w-xl text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight mb-6">
            Welcome to <span className="text-blue-700">PrepWise</span>
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Your smart companion for interview preparation. Practice. Analyze. Succeed.
          </p>
          <Link to="/login">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md">
              Login
            </button>
          </Link>
        </div>
        <div className="mt-10 lg:mt-0">
          <img
            src={heroImage}
            alt="Illustration"
            className="max-w-md w-full rounded-2xl shadow-xl"
          />
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">About PrepWise</h2>
          <p className="text-gray-600 text-lg">
            PrepWise is designed to transform the way you prepare for interviews. With AI-driven feedback, 
            personalized coaching, and real-time performance analysis, you’ll be fully equipped to crack any 
            interview. Whether you’re a fresh graduate or an experienced professional, PrepWise adapts to your 
            unique preparation needs.
          </p>
        </div>
      </div>

      <div className="h-32"></div> {/* Space to allow scrolling */}
    </div>
  );
};

export default Home;
