import React from 'react';
import { BookOpenText, Target, Puzzle } from 'lucide-react';

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-white p-8 rounded-xl border">
    <div className="text-green-600 mb-4">{icon}</div>
    <h3 className="text-black text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Features = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-black text-3xl md:text-4xl font-bold">
            Sve što vam je potrebno za učenje nemačkog jezika
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Naša platforma kombinuje interaktivne lekcije,
            personalizovani vokabular i raznovrsne kvizove kako biste
            učili efikasno i sa zadovoljstvom.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BookOpenText className="h-12 w-12" />}
            title="Interaktivne lekcije"
            description="Interaktivne lekcije koje vas vode kroz osnove i napredne koncepte nemačkog jezika, korak po korak."
          />
          <FeatureCard
            icon={<Target className="h-12 w-12" />}
            title="Personalizovani vokabular"
            description="Izgradite svoj vokabular sa rečima i frazama koje su relevantne za vaše ciljeve učenja."
          />
          <FeatureCard
            icon={<Puzzle className="h-12 w-12" />}
            title="Raznovrsni kvizovi"
            description="Testirajte svoje znanje sa kvizovima koji pokrivaju gramatiku, vokabular i razumevanje."
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
