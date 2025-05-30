// src/pages/Interview.jsx
import React from "react";
import Webcam from "react-webcam";

const Interview = () => {
  const videoConstraints = {
    width: 400,
    height: 300,
    facingMode: "user",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 py-10 bg-gradient-to-r from-blue-50 to-pink-50 font-sans">
      <h2 className="text-3xl font-bold text-blue-800 mb-10">Interview Session</h2>
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Left: Instructions */}
        <div className="w-full md:w-1/2 p-8 bg-white">
          <h3 className="text-2xl font-semibold mb-4 text-blue-700">Instructions</h3>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
            <li>Ensure your webcam and microphone are working properly.</li>
            <li>Sit in a quiet, well-lit space with minimal background noise.</li>
            <li>Maintain eye contact with the camera during your responses.</li>
            <li>You will be asked a series of interview questions.</li>
            <li>Answer clearly and confidently within the time limit.</li>
          </ul>
        </div>

        {/* Right: Webcam */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center bg-gray-100">
          <Webcam
            audio={true}
            height={300}
            width={400}
            videoConstraints={videoConstraints}
            className="rounded-lg shadow-md border border-gray-300"
          />
          <p className="mt-4 text-gray-600">Webcam Preview</p>
        </div>
      </div>
    </div>
  );
};

export default Interview;
