import React from 'react';
import { Building2, TrendingUp, Shield, Globe } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
              <Building2 className="w-8 h-8 text-blue-200" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Simulateur de Régulation Monétaire
              </h1>
              <p className="text-blue-200 mt-1 font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Développé par Jean-Baptiste BATOLA • Système Automatique v2.0
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-emerald-600/20 border border-emerald-400/30 px-4 py-2 rounded-lg backdrop-blur-sm">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-100">Simulation éducative</span>
            </div>
            <div className="flex items-center space-x-2 bg-blue-600/20 border border-blue-400/30 px-4 py-2 rounded-lg backdrop-blur-sm">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-blue-100">Open Source</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2 text-green-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Modèle heuristique</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Données historiques</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-300">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Projections déterministes</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-300">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Projet Éducatif</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;