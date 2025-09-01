'use client';
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Book, PlusCircle } from 'lucide-react';

const AdminPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!title || !content) {
      setError('Naslov i sadržaj su obavezni.');
      setIsLoading(false);
      return;
    }

    try {
      const lessonsCollection = collection(db, 'lessons');
      await addDoc(lessonsCollection, {
        title,
        content,
        createdAt: new Date(),
      });
      setSuccess('Lekcija je uspešno dodata!');
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('Greška pri dodavanju lekcije:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Došlo je do neočekivane greške.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Admin Panel
        </h1>

        <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-2xl shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Book />
              Dodaj novu lekciju
            </h2>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-500 text-sm text-center">
              {success}
            </p>
          )}

          <form className="space-y-6" onSubmit={handleAddLesson}>
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Naslov lekcije
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sadržaj lekcije (podržava Markdown)
              </label>
              <textarea
                id="content"
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 flex items-center justify-center gap-2 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 disabled:bg-green-400"
            >
              {isLoading ? (
                'Dodavanje...'
              ) : (
                <>
                  <PlusCircle size={20} /> Dodaj lekciju
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
