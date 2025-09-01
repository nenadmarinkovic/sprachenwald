import React from 'react';

const Banner = () => {
  return (
    <section className="bg-blue-50 py-20 md:py-32">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight mb-4">
          Dobro došli u {''}
          <span className="text-green-600">Sprachenwald</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Naučite nemački jezik prirodno, korak po korak. Uz našu
          platformu, vaš put do tečnog govora počinje sada.
        </p>
        <a
          href="/signup"
          className="bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-green-700 transition-transform transform hover:scale-105 duration-300 inline-block"
        >
          Kreiraj besplatan nalog
        </a>
      </div>
    </section>
  );
};

export default Banner;
