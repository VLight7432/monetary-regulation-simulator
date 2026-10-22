import React, { useState } from 'react';

const faqs = [
  {
    question: "Comment fonctionne le simulateur ?",
    answer: "Le simulateur modélise l’impact des politiques monétaires sur l’inflation, le bien-être et l’inégalité selon différents scénarios."
  },
  {
    question: "Que signifie l’indicateur de bien-être ?",
    answer: "Il mesure la qualité de vie globale, influencée par l’inflation, la croissance et la répartition des richesses."
  },
  // Ajoute d'autres questions/réponses ici
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="p-6 bg-white rounded shadow max-w-2xl mx-auto my-8">
      <h2 className="text-xl font-bold mb-4">FAQ</h2>
      <ul>
        {faqs.map(({ question, answer }, idx) => (
          <li key={question} className="mb-4">
            <button
              className="font-semibold text-blue-700 underline"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              {question}
            </button>
            {openIndex === idx && (
              <div className="mt-2 text-gray-700">{answer}</div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FAQ;