import React from 'react';
import { BookMarked } from 'lucide-react';

const CoursesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Naši kursevi
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Pronađite savršen kurs za vaš nivo znanja.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="p-8 bg-white rounded-2xl shadow-lg">
          <div className="flex items-center justify-center text-center text-gray-500">
            <BookMarked className="w-12 h-12 mb-4" />
          </div>
          <p className="text-center text-gray-600">
            Kursevi i lekcije će uskoro biti dostupni ovde.
            Administrator može dodati nove lekcije putem admin panela.
          </p>
        </div>
      </main>
    </div>
  );
};

export default CoursesPage;
