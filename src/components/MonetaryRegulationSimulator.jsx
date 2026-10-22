import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { Play, Pause, RotateCcw, TrendingUp, TrendingDown, AlertTriangle, Info, Presentation, Compass } from 'lucide-react';
import IndicatorCard from './IndicatorCard';
import ScenarioSelector from './ScenarioSelector';
import ChartContainer from './ChartContainer';
import RegulationExplainer from './RegulationExplainer';
import AdvancedControls from './AdvancedControls';
import PredictionPanel from './PredictionPanel';
import HistoricalAnalysis from './HistoricalAnalysis';
import RealTimeMetrics from './RealTimeMetrics';
import ExportTools from './ExportTools';
import NotificationSystem from './NotificationSystem';
import ScenarioComparison from './ScenarioComparison';
import PolicyComparison from './PolicyComparison';
import ScenarioDesigner from './ScenarioDesigner';
import MacroContextDashboard from './MacroContextDashboard';
import AnnualComparisonDashboard from './AnnualComparisonDashboard';
import DecisionSupportPanel from './DecisionSupportPanel';
import ForecastModelComparison from './ForecastModelComparison';
import DecisionPresentation from './DecisionPresentation.jsx';
import PilotDemo from './PilotDemo.jsx';
import DataQualityBadge from './DataQualityBadge.jsx';
import { defaultParameters, initialEconomicState, useSimulation } from '../hooks/useSimulation';
import { useNotifications } from '../hooks/useNotifications';
import ChartTooltip from './ChartTooltip';
import { useOfficialInflation } from '../hooks/useOfficialInflation';
import { useEconomicContext } from '../hooks/useEconomicContext';
import { useMacroContext } from '../hooks/useMacroContext';
import { eurostatInflationSource } from '../services/eurostat';
import { buildInflationComparisonData } from '../utils/inflationChart';
import { calibrateInflation } from '../utils/inflationCalibration';
import { evaluateInflationBacktest } from '../utils/inflationBacktest';
import { buildForecastComparison } from '../utils/forecastModels';
import { buildDecisionSupport, buildForecastBenchmark, evaluateDecisionReadiness } from '../utils/decisionSupport.js';
import { assessDataQuality } from '../utils/dataQuality.js';
import { workspaceTabs, getNextWorkspace } from '../utils/workspaces.js';

const MonetaryRegulationSimulator = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('overview');
  const [isPresenting, setIsPresenting] = useState(false);
  const [isPilotDemoOpen, setIsPilotDemoOpen] = useState(false);
  
  const {
    isRunning,
    currentMonth,
    scenario,
    scenarioData,
    data,
    currentState,
    parameters,
    predictions,
    alertThresholds,
    inflationCalibration: activeInflationCalibration,
    setIsRunning,
    setScenario,
    reset,
    updateParameters,
    updateAlertThresholds,
    setReferenceInflation,
    setInflationCalibration,
    updateScenarioDesign
  } = useSimulation();
  const officialInflation = useOfficialInflation();
  const economicContext = useEconomicContext();
  const macroContext = useMacroContext();

  const {
    notifications,
    addNotification,
    clearNotification,
    clearAllNotifications
  } = useNotifications();
  const inflationComparisonData = officialInflation.data
    ? buildInflationComparisonData(
      officialInflation.data.inflation.FR,
      officialInflation.data.inflation.EA20,
      data
    )
    : [];
  const inflationCalibration = useMemo(() => (
    !officialInflation.data ? null : (() => {
      try {
        return calibrateInflation(
          officialInflation.data.inflation.FR,
          officialInflation.data.inflation.EA20
        );
      } catch {
        return null;
      }
    })()
  ), [officialInflation.data]);
  const inflationBacktest = useMemo(() => (
    !officialInflation.data ? null : (() => {
      try {
        return evaluateInflationBacktest(
          officialInflation.data.inflation.FR,
          officialInflation.data.inflation.EA20
        );
      } catch {
        return null;
      }
    })()
  ), [officialInflation.data]);
  const forecastComparison = useMemo(() => (
    !officialInflation.data ? null : buildForecastComparison(
      officialInflation.data.inflation.FR,
      officialInflation.data.inflation.EA20
    )
  ), [officialInflation.data]);
  const decisionReadiness = useMemo(() => evaluateDecisionReadiness({
    sourceStatus: officialInflation.status,
    sourceUpdatedAt: officialInflation.data?.updatedAt,
    calibration: inflationCalibration,
    backtest: inflationBacktest
  }), [inflationBacktest, inflationCalibration, officialInflation.data?.updatedAt, officialInflation.status]);
  const dataSources = [officialInflation, economicContext, ...Object.values(macroContext.states)];
  const unavailableDataSources = dataSources.filter(({ status }) => status === 'error').length;
  const loadingDataSources = dataSources.filter(({ status }) => status === 'loading').length;
  const staleDataSources = dataSources.filter((state) => assessDataQuality(state, state.data?.updatedAt).level === 'stale').length;
  const incompleteDataSources = dataSources.filter((state) => assessDataQuality(state, state.data?.updatedAt).level === 'incomplete').length;
  const activeAlerts = notifications.filter(({ type }) => type === 'warning').length;
  const decisionBenchmark = useMemo(() => buildForecastBenchmark(inflationCalibration), [inflationCalibration]);
  const decisionSupport = useMemo(() => buildDecisionSupport({
    readiness: decisionReadiness,
    benchmark: decisionBenchmark,
    currentState,
    parameters,
    scenarioName: scenarioData.name,
    alternatives: []
  }), [currentState, decisionBenchmark, decisionReadiness, parameters, scenarioData.name]);

  const handleWorkspaceKeyDown = (event) => {
    const nextWorkspace = getNextWorkspace(activeWorkspace, event.key);
    if (nextWorkspace) {
      event.preventDefault();
      setActiveWorkspace(nextWorkspace);
      document.getElementById(`workspace-tab-${nextWorkspace}`)?.focus();
    }
  };

  useEffect(() => {
    const latestFranceInflation = officialInflation.data?.inflation.FR?.at(-1)?.value;
    if (Number.isFinite(latestFranceInflation)) {
      setReferenceInflation(latestFranceInflation);
    }
  }, [officialInflation.data, setReferenceInflation]);

  useEffect(() => {
    if (inflationCalibration) {
      setInflationCalibration(inflationCalibration);
    }
  }, [inflationCalibration, setInflationCalibration]);

  useEffect(() => {
    if (data.length === 0) {
      return;
    }

    const latestState = data[data.length - 1];
    const monitoredMetrics = [
      { key: 'inflation', label: 'Inflation', unit: '%' },
      { key: 'wellbeing', label: 'Bien-être', unit: '/100' },
      { key: 'inequality', label: 'Inégalités', unit: '/100' }
    ];

    monitoredMetrics.forEach(({ key, label, unit }) => {
      const threshold = alertThresholds[key];
      const value = latestState[key];

      if (value < threshold.min || value > threshold.max) {
        const boundary = value < threshold.min ? 'minimum' : 'maximum';
        addNotification({
          type: 'warning',
          title: `Seuil d'alerte : ${label}`,
          message: `${label} atteint ${value.toFixed(1)}${unit}, au-delà du seuil ${boundary} de ${threshold[boundary === 'minimum' ? 'min' : 'max']}${unit}.`
        });
      }
    });
  }, [addNotification, alertThresholds, data]);

  const getStatusColor = (inflation) => {
    if (inflation < 0) return 'text-blue-600';
    if (inflation < 2) return 'text-green-600';
    if (inflation < 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (inflation) => {
    if (inflation < 0) return <TrendingDown className="w-4 h-4" />;
    if (inflation > 4) return <AlertTriangle className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName) || e.target.isContentEditable) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsRunning(!isRunning);
          break;
        case 'r':
        case 'R':
          reset();
          break;
        case 'a':
        case 'A':
          setShowAdvanced(!showAdvanced);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, showAdvanced, setIsRunning, reset]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="simulation-container p-6 max-w-7xl mx-auto">
        <NotificationSystem 
          notifications={notifications}
          onClear={clearNotification}
          onClearAll={clearAllNotifications}
        />

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
        <div className="flex flex-wrap gap-6 mb-8 items-center">
          <div className="flex gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 ${
                isRunning 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-200' 
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-emerald-200'
              } hover:shadow-xl hover:scale-105`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isRunning ? 'Arrêter la Simulation' : 'Lancer la Simulation'}
            </button>
            
            <button
              onClick={reset}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-500 to-gray-600 text-white rounded-xl hover:from-slate-600 hover:to-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              <RotateCcw className="w-5 h-5" />
              Réinitialiser
            </button>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                showAdvanced 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
              }`}
            >
              Paramètres Avancés
            </button>
            <button
              type="button"
              onClick={() => setIsPresenting(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Presentation className="h-5 w-5" />
              Présenter
            </button>
            <button
              type="button"
              onClick={() => {
                setScenario('inflation');
                setIsPilotDemoOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-3 font-medium text-white shadow-sm transition hover:bg-sky-800"
            >
              <Compass className="h-5 w-5" />
              Pilot demo
            </button>
          </div>
          
          <ScenarioSelector scenario={scenario} scenarioData={scenarioData} setScenario={setScenario} />
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            Mois: {currentMonth}/24
          </div>

          <div className="ml-auto">
            <ExportTools 
              data={data}
              currentState={currentState}
              scenario={scenario}
              sourceUpdatedAt={officialInflation.data?.updatedAt}
            />
          </div>
        </div>

      </div>

      <nav className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm" aria-label="Espaces de travail">
        <div role="tablist" aria-orientation="horizontal" className="flex min-w-max gap-1" onKeyDown={handleWorkspaceKeyDown}>
          {workspaceTabs.map(({ id, label }) => (
            <button
              key={id}
              id={`workspace-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={activeWorkspace === id}
              aria-controls={`workspace-panel-${id}`}
              tabIndex={activeWorkspace === id ? 0 : -1}
              onClick={() => setActiveWorkspace(id)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${activeWorkspace === id ? 'bg-indigo-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}`}
            >{label}</button>
          ))}
        </div>
      </nav>

      <div id={`workspace-panel-${activeWorkspace}`} role="tabpanel" aria-labelledby={`workspace-tab-${activeWorkspace}`} tabIndex="0">
      {/* Advanced Controls */}
      {activeWorkspace === 'scenarios' && showAdvanced && (
        <AdvancedControls
          parameters={parameters}
          onUpdateParameters={updateParameters}
          alertThresholds={alertThresholds}
          onUpdateThresholds={updateAlertThresholds}
        />
      )}

      {/* Scenario Comparison */}
      {activeWorkspace === 'scenarios' && data.length > 3 && (
        <ScenarioComparison 
          scenario={scenario}
          scenarioData={scenarioData}
          currentState={currentState}
        />
      )}

      {activeWorkspace === 'scenarios' && <ScenarioDesigner
        scenario={scenario}
        onUpdateScenario={updateScenarioDesign}
        onResetScenario={setScenario}
      />}

      {activeWorkspace === 'overview' && <>
      <MacroContextDashboard
        inflation={officialInflation}
        unemployment={economicContext}
        macroContext={macroContext}
      />
      <section className="mb-6 grid gap-4 lg:grid-cols-2" aria-label="Résumé de statut">
        <article className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-indigo-950">Statut conditionnel de l’appui à la décision</h2>
          <p className="mt-2 text-sm text-indigo-900">{decisionReadiness.eligible ? 'Sortie conditionnelle disponible, sous revue humaine obligatoire.' : 'Sortie conditionnelle bloquée : consultez les garde-fous avant toute interprétation.'}</p>
          <p className="mt-2 text-xs text-indigo-700">Ce statut décrit les contrôles du prototype ; il ne formule pas de conclusion de politique publique.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Qualité des données et alertes</h2>
          <p className="mt-2 text-sm text-slate-700">{unavailableDataSources || incompleteDataSources ? `${Math.max(unavailableDataSources, incompleteDataSources)} source${Math.max(unavailableDataSources, incompleteDataSources) > 1 ? 's' : ''} incomplète${Math.max(unavailableDataSources, incompleteDataSources) > 1 ? 's' : ''}.` : staleDataSources ? `${staleDataSources} source${staleDataSources > 1 ? 's' : ''} ancienne${staleDataSources > 1 ? 's' : ''}.` : loadingDataSources ? `${loadingDataSources} source${loadingDataSources > 1 ? 's' : ''} en cours de chargement.` : 'Sources de contexte à jour ou dans le délai acceptable.'}</p>
          <p className={`mt-2 text-sm ${activeAlerts ? 'font-medium text-amber-800' : 'text-slate-600'}`}>{activeAlerts ? `${activeAlerts} alerte${activeAlerts > 1 ? 's' : ''} de seuil active${activeAlerts > 1 ? 's' : ''}.` : 'Aucune alerte de seuil active.'}</p>
        </article>
      </section>
        {activeWorkspace === 'overview' && <>
        {/* Real-time Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <IndicatorCard
            title="Inflation"
            value={`${currentState.inflation.toFixed(1)}%`}
            color={getStatusColor(currentState.inflation)}
            icon={getStatusIcon(currentState.inflation)}
          />
          <IndicatorCard
            title="Dividende"
            value={`${Math.round(currentState.dividend)}€`}
            color="text-green-600"
          />
          <IndicatorCard
            title="Taxe Patrimoine"
            value={`${currentState.taxRate.toFixed(1)}%`}
            color="text-red-600"
          />
          <IndicatorCard
            title="Crédit Public"
            value={`${Math.round(currentState.creditVolume)}%`}
            color="text-blue-600"
          />
          <IndicatorCard
            title="Bien-être"
            value={Math.round(currentState.wellbeing)}
            color="text-purple-600"
          />
          <IndicatorCard
            title="Inégalités"
            value={Math.round(currentState.inequality)}
            color="text-orange-600"
          />
        </div>
        </>}
      <RealTimeMetrics currentState={currentState} data={data} />
      </>}
      {activeWorkspace === 'observed-data' && <AnnualComparisonDashboard />}
      {activeWorkspace === 'methodology-audit' && <DecisionSupportPanel
        inflation={officialInflation}
        calibration={inflationCalibration}
        backtest={inflationBacktest}
        currentState={currentState}
        parameters={parameters}
        scenarioData={scenarioData}
      />}
      {activeWorkspace === 'forecasts-models' && <ForecastModelComparison
        comparison={forecastComparison}
        sourceStatus={officialInflation.status}
        sourceUpdatedAt={officialInflation.data?.updatedAt}
      />}

      {activeWorkspace === 'scenarios' && <PolicyComparison
        currentState={currentState}
        currentMonth={currentMonth}
        scenarioData={scenarioData}
        parameters={parameters}
        inflationCalibration={activeInflationCalibration}
      />}

      {/* Predictions */}
      {activeWorkspace === 'forecasts-models' && <PredictionPanel
        currentState={currentState}
        predictions={predictions}
      />}

      {/* Historical Analysis */}
      {activeWorkspace === 'observed-data' && <HistoricalAnalysis data={data} />}

      {/* Charts */}
      {activeWorkspace === 'observed-data' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer title="Inflation et ajustement fiscal" question="L’inflation simulée converge-t-elle vers la cible de 2 % ?" description="Ligne rouge : inflation simulée. Ligne orange : taxe sur le patrimoine. Ligne bleue pointillée : cible d’inflation à 2 %. Les traits verticaux identifient les chocs programmés du scénario.">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                content={({ label, payload }) =>
                  payload && payload.length > 0 ? (
                    <ChartTooltip
                      label={label}
                      value={payload[0].value}
                      description="Ce point représente l’inflation mensuelle. Une inflation élevée peut impacter le pouvoir d’achat."
                    />
                  ) : null
                }
              />
              <Legend />
              <ReferenceLine y={2} stroke="#2563eb" strokeDasharray="4 4" label="Cible 2 %" />
              {scenarioData.shocks?.map(({ month, type }) => <ReferenceLine key={`${month}-${type}`} x={month} stroke="#64748b" strokeDasharray="2 4" label={`Choc : ${type}`} />)}
              <Line type="monotone" dataKey="inflation" stroke="#ef4444" name="Inflation %" strokeWidth={2} />
              <Line type="monotone" dataKey="taxRate" stroke="#f97316" name="Taxe Patrimoine %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Dividende et crédit public" question="Quels ajustements distributifs et de crédit accompagnent la simulation ?" description="La ligne verte montre le dividende simulé ; la ligne bleue le volume de crédit public. Les deux échelles suivent leurs unités propres, indiquées dans la légende.">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="dividend" stroke="#22c55e" name="Dividende €" strokeWidth={2} />
              <Line type="monotone" dataKey="creditVolume" stroke="#3b82f6" name="Crédit Public %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Indicateurs sociaux" question="Comment le scénario fait-il évoluer le bien-être et les inégalités synthétiques ?" description="Ligne violette : indice de bien-être synthétique. Ligne orange : indice d’inégalités synthétique. Ces indices sont des sorties heuristiques du simulateur.">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="wellbeing" stroke="#8b5cf6" name="Bien-être" strokeWidth={2} />
              <Line type="monotone" dataKey="inequality" stroke="#f59e0b" name="Inégalités" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <RegulationExplainer />
      </div>}
      {activeWorkspace === 'methodology-audit' && <RegulationExplainer />}

      {activeWorkspace === 'observed-data' && <section className="p-6 bg-white rounded shadow max-w-3xl mx-auto my-8">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Inflation harmonisée : France et zone euro</h2>
            <p className="mt-1 text-sm text-gray-600">
              Variation annuelle de l'IPCH et prolongement par la simulation sélectionnée.
            </p>
          </div>
          {officialInflation.status === 'ready' && inflationCalibration && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              Mise à jour : {new Date(officialInflation.data.updatedAt).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
        {officialInflation.status === 'loading' && (
          <div className="flex h-64 items-center justify-center text-sm text-gray-500">
            Chargement des données Eurostat…
          </div>
        )}
        {officialInflation.status === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Les données Eurostat sont indisponibles. {officialInflation.error.message}
            <button
              type="button"
              onClick={officialInflation.reload}
              className="ml-3 font-semibold underline"
            >
              Réessayer
            </button>
          </div>
        )}
        {officialInflation.status === 'ready' && inflationBacktest && (
          <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Fenêtre calibrée</div>
              <div className="mt-1 font-semibold">{inflationCalibration.observationCount} mois jusqu'à {inflationCalibration.lastPeriod}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Référence du modèle</div>
              <div className="mt-1 font-semibold">{inflationCalibration.referenceInflation.toFixed(2)} %</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Retour à la référence</div>
              <div className="mt-1 font-semibold">{(inflationCalibration.meanReversion * 100).toFixed(0)} % par mois</div>
            </div>
          </div>
        )}
        {officialInflation.status === 'ready' && (
          <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-indigo-950">Backtest pseudo-temps réel</h3>
              <p className="mt-1 text-xs text-indigo-800">
                Prévision à un mois produite uniquement avec les données disponibles à chaque date passée.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm text-indigo-950 sm:grid-cols-3">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-indigo-600">Erreur absolue moyenne</div>
                <div className="mt-1 font-semibold">{inflationBacktest.meanAbsoluteError.toFixed(2)} point</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-indigo-600">Biais moyen</div>
                <div className="mt-1 font-semibold">{inflationBacktest.meanBias.toFixed(2)} point</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-indigo-600">Couverture de l'intervalle 80 %</div>
                <div className="mt-1 font-semibold">{inflationBacktest.intervalCoverage.toFixed(0)} % sur {inflationBacktest.results.length} mois</div>
              </div>
            </div>
          </div>
        )}
        {officialInflation.status === 'ready' && (
          <>
          <p className="mb-3 text-sm font-medium text-slate-700">Comment l’inflation IPCH France et EA20 se situe-t-elle par rapport à la cible de 2 % ?</p>
          <ResponsiveContainer width="100%" height={300} aria-label="Historique IPCH France et zone euro, prolongé par l’inflation simulée avec cible à 2 pour cent">
            <LineChart data={inflationComparisonData} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" minTickGap={32} />
              <YAxis unit="%" />
              <Tooltip />
              <Legend />
              <ReferenceLine y={2} stroke="#2563eb" strokeDasharray="4 4" label="Cible 2 %" />
              <Line type="monotone" dataKey="france" stroke="#2563eb" name="France" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="euroArea" stroke="#7c3aed" name="Zone euro (EA20)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="simulation" stroke="#f97316" name="Simulation" strokeWidth={2} strokeDasharray="6 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          </>
        )}
        <DataQualityBadge state={officialInflation} updatedAt={officialInflation.data?.updatedAt} definition="IPCH annuel, France et EA20" source={eurostatInflationSource.label} />
        <div className="mt-2 text-xs text-gray-500">
          La simulation débute après la dernière observation française affichée.
          {' '}
          Source : <a className="underline" href={eurostatInflationSource.url} target="_blank" rel="noreferrer">{eurostatInflationSource.label}</a>
        </div>
      </section>}
      </div>
      {isPresenting && <DecisionPresentation
        onClose={() => setIsPresenting(false)}
        inflation={officialInflation}
        scenarioData={scenarioData}
        support={decisionSupport}
        readiness={decisionReadiness}
        benchmark={decisionBenchmark}
      />}
      {isPilotDemoOpen && <PilotDemo
        onClose={() => setIsPilotDemoOpen(false)}
        initialState={initialEconomicState}
        parameters={defaultParameters}
        inflation={officialInflation}
        unemployment={economicContext}
      />}
      </div>
    </div>
  );
};

export default MonetaryRegulationSimulator;