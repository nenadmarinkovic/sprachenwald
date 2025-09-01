'use client';
import React from 'react';
import { Mail, Lock, Chrome, User } from 'lucide-react';

const SignupPage = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50 py-12">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl ">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Kreirajte nalog
          </h1>
          <p className="mt-2 text-gray-600">
            Započnite svoje putovanje u učenju jezika danas.
          </p>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="relative">
            <User className="absolute w-5 h-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ime"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="relative">
            <Mail className="absolute w-5 h-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="Email adresa"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="relative">
            <Lock className="absolute w-5 h-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="Lozinka"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300"
          >
            Registruj se
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative px-2 bg-white text-sm text-gray-500">
            Ili nastavite sa
          </div>
        </div>

        <button className="w-full py-3 flex items-center justify-center gap-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-300">
          <Chrome className="w-5 h-5" />
          <span className="font-semibold text-gray-700">Google</span>
        </button>

        <p className="text-sm text-center text-gray-600">
          Već imate nalog?{' '}
          <a
            href="/login"
            className="font-medium text-green-600 hover:underline"
          >
            Prijavite se
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
