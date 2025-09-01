'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LogOut } from 'lucide-react';

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Greška prilikom odjavljivanja:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Učitavanje...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">
            Sprachenwald
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Dobrodošli, {user.displayName || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              <LogOut size={16} />
              <span>Odjavi se</span>
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Kontrolna tabla
        </h2>
        <div className="p-8 bg-white rounded-2xl shadow-lg">
          <p className="text-gray-600">
            Ovde će biti vaše lekcije, kvizovi i napredak.
          </p>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
