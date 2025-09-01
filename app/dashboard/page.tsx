'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  slug: string;
}

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          await fetchLessons();
        } else {
          router.push('/login');
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  const fetchLessons = async () => {
    try {
      const lessonsCollection = collection(db, 'lessons');
      const q = query(
        lessonsCollection,
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const lessonsData = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Lesson)
      );
      setLessons(lessonsData);
    } catch (error) {
      console.error('Greška prilikom preuzimanja lekcija:', error);
    }
  };

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
            Dashboard
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
        <div className="p-8 bg-white rounded-2xl border">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Dostupne lekcije
          </h3>
          {lessons.length > 0 ? (
            <ul className="space-y-4">
              {lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="p-4 border rounded-lg hover:bg-gray-100"
                >
                  <Link
                    href={`/lessons/${lesson.slug}`}
                    className="font-bold text-xl text-green-600"
                    prefetch
                  >
                    {lesson.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">
              Trenutno nema dostupnih lekcija.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
