'use client';

import { Sprout, Shield, LogOut, BookHeart } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useAdmin } from '@/hooks/useAdmin';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const Header = () => {
  const { user, isLoading: isUserLoading } = useUser();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to homepage after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Sprout className="h-8 w-8 text-green-600 mr-2" />
          <Link href="/" className="text-2xl font-bold text-gray-800">
            Sprachenwald
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/courses"
            className="text-gray-600 hover:text-green-600 transition-colors duration-300"
          >
            Courses
          </Link>
          {isClient && user && (
            <Link
              href="/sprachgarten"
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors duration-300"
            >
              <BookHeart size={18} />
              Sprachgarten
            </Link>
          )}
          {isClient && !isAdminLoading && isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-300 font-semibold"
            >
              <Shield size={18} />
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {isClient ? (
            isUserLoading ? (
              <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="font-medium text-gray-600 hover:text-green-600 transition-colors duration-300"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors duration-300"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors duration-300"
                >
                  Sign Up
                </Link>
              </>
            )
          ) : (
            <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
