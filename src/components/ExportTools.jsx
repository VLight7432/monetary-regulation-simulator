import React, { useState } from 'react';
import { Share, Camera, FileText, BarChart } from 'lucide-react';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { hicpContextMetadata } from '../utils/comparisonGovernance.js';

const ExportTools = ({ data, currentState, scenario, sourceUpdatedAt }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    const headers = ['Mois', 'Inflation', 'Dividende', 'Taxe_Patrimoine', 'Credit_Public', 'Bien_etre', 'Inegalites'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.month,
        row.inflation.toFixed(2),
        row.dividend.toFixed(2),
        row.taxRate.toFixed(2),
        row.creditVolume.toFixed(2),
        row.wellbeing.toFixed(2),
        row.inequality.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `simulation_${scenario}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportToJSON = () => {
    const exportData = {
      scenario,
      timestamp: new Date().toISOString(),
      currentState,
      data,
      metadata: {
        duration: data.length,
        finalInflation: currentState.inflation,
        avgWellbeing: data.reduce((acc, d) => acc + d.wellbeing, 0) / data.length,
        avgInequality: data.reduce((acc, d) => acc + d.inequality, 0) / data.length,
        sourceVintage: sourceUpdatedAt || null,
        seriesDefinition: hicpContextMetadata
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    saveAs(blob, `simulation_${scenario}_${format(new Date(), 'yyyy-MM-dd')}.json`);
  };

  const exportReport = () => {
    const report = generateReport(data, currentState, scenario, sourceUpdatedAt);
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    saveAs(blob, `rapport_${scenario}_${format(new Date(), 'yyyy-MM-dd')}.txt`);
  };

  const captureScreenshot = async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector('.simulation-container') || document.body;
      const canvas = await html2canvas(element, {
        backgroundColor: '#f9fafb',
        scale: 2
      });
      
      canvas.toBlob((blob) => {
        saveAs(blob, `simulation_screenshot_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.png`);
      });
    } catch (error) {
      console.error('Erreur lors de la capture:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Simulation Régulation Monétaire',
          text: `Résultats de simulation ${scenario}: Inflation ${currentState.inflation.toFixed(1)}%, Bien-être ${currentState.wellbeing.toFixed(0)}`,
          url: window.location.href
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erreur lors du partage:', error);
        }
      }
    } else {
      // Fallback: copier dans le presse-papier
      const summary = `Simulation ${scenario}: Inflation ${currentState.inflation.toFixed(1)}%, Dividende ${currentState.dividend}€, Bien-être ${currentState.wellbeing.toFixed(0)}`;
      navigator.clipboard.writeText(summary);
      alert('Résultats copiés dans le presse-papier!');
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToCSV}
        className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        disabled={data.length === 0}
      >
        <FileText className="w-3 h-3" />
        CSV
      </button>

      <button
        onClick={exportToJSON}
        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        disabled={data.length === 0}
      >
        <BarChart className="w-3 h-3" />
        JSON
      </button>

      <button
        onClick={exportReport}
        className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        disabled={data.length === 0}
      >
        <FileText className="w-3 h-3" />
        Rapport
      </button>

      <button
        onClick={captureScreenshot}
        className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
        disabled={isExporting}
      >
        <Camera className="w-3 h-3" />
        {isExporting ? 'Capture...' : 'Screenshot'}
      </button>

      <button
        onClick={shareResults}
        className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        disabled={data.length === 0}
      >
        <Share className="w-3 h-3" />
        Partager
      </button>
    </div>
  );
};

const generateReport = (data, currentState, scenario, sourceUpdatedAt) => {
  const avgInflation = data.reduce((acc, d) => acc + d.inflation, 0) / data.length;
  const avgWellbeing = data.reduce((acc, d) => acc + d.wellbeing, 0) / data.length;
  const avgInequality = data.reduce((acc, d) => acc + d.inequality, 0) / data.length;
  const maxInflation = Math.max(...data.map(d => d.inflation));
  const minInflation = Math.min(...data.map(d => d.inflation));

  return `
RAPPORT DE SIMULATION - RÉGULATION MONÉTAIRE AUTOMATIQUE
========================================================

Date: ${format(new Date(), 'dd/MM/yyyy HH:mm')}
Scénario: ${scenario}
Durée: ${data.length} mois
Millésime IPCH Eurostat consulté: ${sourceUpdatedAt || 'indisponible'}
Couverture IPCH utilisée pour le contexte: France et zone euro (EA20)
Définition: ${hicpContextMetadata.definition}
Fréquence / unité: ${hicpContextMetadata.frequency} / ${hicpContextMetadata.unit}

RÉSULTATS FINAUX
----------------
Inflation finale: ${currentState.inflation.toFixed(2)}%
Dividende final: ${currentState.dividend.toFixed(0)}€
Taxe patrimoine: ${currentState.taxRate.toFixed(1)}%
Crédit public: ${currentState.creditVolume.toFixed(0)}%
Bien-être: ${currentState.wellbeing.toFixed(0)}/100
Inégalités: ${currentState.inequality.toFixed(0)}/100

STATISTIQUES MOYENNES
---------------------
Inflation moyenne: ${avgInflation.toFixed(2)}%
Inflation min/max: ${minInflation.toFixed(2)}% / ${maxInflation.toFixed(2)}%
Bien-être moyen: ${avgWellbeing.toFixed(0)}/100
Inégalités moyennes: ${avgInequality.toFixed(0)}/100

ÉVALUATION DU SYSTÈME
--------------------
${avgInflation < 3 ? '✓' : '✗'} Stabilité des prix: ${avgInflation < 3 ? 'Objectif atteint' : 'À améliorer'}
${avgWellbeing > 70 ? '✓' : '✗'} Bien-être social: ${avgWellbeing > 70 ? 'Satisfaisant' : 'Insuffisant'}
${avgInequality < 40 ? '✓' : '✗'} Réduction inégalités: ${avgInequality < 40 ? 'Objectif atteint' : 'Progrès nécessaires'}
${maxInflation < 6 ? '✓' : '✗'} Gestion des crises: ${maxInflation < 6 ? 'Efficace' : 'À renforcer'}

POINTS À EXAMINER SOUS REVUE HUMAINE
------------------------------------
${avgInflation > 3 ? '- Examiner les paramètres de taxation dans le scénario, sans conclure à un effet causal.\n' : ''}
${avgWellbeing < 70 ? '- Examiner les hypothèses de dividende et de bien-être.\n' : ''}
${avgInequality > 40 ? '- Examiner les hypothèses de progressivité fiscale.\n' : ''}
${maxInflation > 6 ? '- Examiner les mécanismes d’urgence dans un scénario de stress.\n' : ''}

LIMITES ET GOUVERNANCE
----------------------
Ce document est généré par un prototype éducatif. Il ne constitue ni une prévision
certifiée, ni un conseil, ni une décision de politique publique. Toute interprétation
requiert une revue humaine indépendante ; les données publiques peuvent être révisées.

Generated by Simulateur de Régulation Monétaire v2.0
`;
};

export default ExportTools;