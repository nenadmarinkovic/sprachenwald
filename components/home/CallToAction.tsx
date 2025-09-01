import React from 'react';

const CallToAction = () => {
  return (
    <section className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Spremni da počnete svoje jezičko putovanje?
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8">
          Pridružite se hiljadama zadovoljnih korisnika koji su već
          unapredili svoje jezičke veštine sa Sprachenwaldom.
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

export default CallToAction;
