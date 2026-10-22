import React from 'react';

const glossary = [
  {
    term: "Inflation cible",
    definition: "Taux d'inflation que la politique monétaire cherche à atteindre pour garantir la stabilité économique.",
    example: "Exemple : Une inflation cible de 2% signifie que la banque centrale vise à maintenir l’augmentation des prix autour de ce niveau."
  },
  {
    term: "Intensité fiscale",
    definition: "Force de la taxation appliquée dans le modèle économique.",
    example: "Exemple : Une intensité fiscale élevée peut réduire l’inégalité mais freiner la croissance."
  },
  // Ajoute d'autres paramètres et indicateurs ici
];

const Glossary = () => (
  <section className="p-6 bg-white rounded shadow max-w-2xl mx-auto my-8">
    <h2 className="text-xl font-bold mb-4">Glossaire</h2>
    <ul>
      {glossary.map(({ term, definition, example }) => (
        <li key={term} className="mb-4">
          <span className="font-semibold">{term} :</span>
          <span className="ml-2">{definition}</span>
          <div className="text-gray-600 text-sm mt-1">{example}</div>
        </li>
      ))}
    </ul>
  </section>
);

export default Glossary;