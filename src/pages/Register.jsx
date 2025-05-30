import React from "react";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-100 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">Create a PrepWise Account</h2>
        <form className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md"
          >
            Register
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account? <Link to="/login" className="text-indigo-600 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
