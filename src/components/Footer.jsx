import React from 'react';
import { Building2, Shield, Globe, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-200" />
              </div>
              <h3 className="text-xl font-bold">Jean-Baptiste BATOLA</h3>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed mb-4">
              Simulateur de régulation monétaire automatique. Outil de recherche et
              d'analyse pour l'étude des systèmes monétaires publics et de leurs impacts
              sur la stabilité économique et sociale.
            </p>
            <div className="flex items-center gap-4 text-sm text-blue-300">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Open Source</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>Projet Personnel</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-100">Fonctionnalités Avancées</h4>
            <ul className="text-blue-200 text-sm space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                Modèle de simulation éducatif
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Projections déterministes à court terme
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                Comparaison aux plages du scénario
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                Export des résultats de simulation
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-100">Contact</h4>
            <div className="space-y-3 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>jean-baptiste.batola@outlook.com</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <span>Documentation GitHub</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-blue-300">
              <p>Raccourcis clavier:</p>
              <p>• Espace: Play/Pause • R: Reset • A: Avancé</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 space-y-3">
          <div className="flex items-center justify-between text-sm text-blue-300">
            <div>
              <p>&copy; 2024 Jean-Baptiste BATOLA. Tous droits réservés.</p>
            </div>
            <div className="flex items-center gap-4">
              <span>Version 2.0.1</span>
              <span>•</span>
              <span>Dernière MAJ: {new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          <div className="text-center text-xs text-blue-400">
            <p className="bg-white/5 rounded-lg py-2 px-4 inline-block">
              <span className="text-blue-200">Projet développé par</span>{' '}
              <span className="font-semibold text-white">Jean-Baptiste BATOLA</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;