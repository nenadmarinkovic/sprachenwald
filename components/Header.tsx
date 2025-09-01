import { Sprout, TreePalm } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const Header = () => {
  return (
    <header className="bg-white border sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Sprout className="h-8 w-8 text-green-600 mr-2" />
          <Link href="/" className="text-2xl font-bold text-gray-800">
            Sprachenwald
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <a
            href="/courses"
            className="text-gray-600 hover:text-green-600 transition-colors duration-300"
          >
            Courses
          </a>
          <a
            href="/about"
            className="text-gray-600 hover:text-green-600 transition-colors duration-300"
          >
            About
          </a>
          <a
            href="/pricing"
            className="text-gray-600 hover:text-green-600 transition-colors duration-300"
          >
            Pricing
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="/login"
            className="text-gray-600 hover:text-green-600 transition-colors duration-300"
          >
            Login
          </a>
          <a
            href="/signup"
            className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors duration-300"
          >
            Sign Up
          </a>
        </div>
      </nav>
    </header>
  );
};

export default Header;
