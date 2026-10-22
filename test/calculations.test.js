import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateAdjustments,
  generatePredictions,
  simulateInflation
} from '../src/utils/calculations.js';
import { scenarios } from '../src/data/scenarios.js';
import {
  createInitialSimulationState,
  simulationReducer
} from '../src/hooks/useSimulation.js';
import { parseEurostatGeoTimeSeries, parseEurostatInflation } from '../src/services/eurostat.js';
import { parseEcbSdmxSeries } from '../src/services/macro.js';
import { alignAnnualSeries, parseWorldBankAnnualSeries } from '../src/services/annualComparison.js';
import { buildInflationComparisonData } from '../src/utils/inflationChart.js';
import { calibrateInflation } from '../src/utils/inflationCalibration.js';
import { evaluateInflationBacktest } from '../src/utils/inflationBacktest.js';
import {
  alignForecastObservations,
  buildForecastComparison
} from '../src/utils/forecastModels.js';
import { comparePolicyScenarios } from '../src/utils/policySimulation.js';
import {
  buildCustomScenario,
  defaultScenarioAdjustments
} from '../src/utils/scenarioDesign.js';
import {
  buildDecisionSupport,
  buildForecastBenchmark,
  evaluateDecisionReadiness
} from '../src/utils/decisionSupport.js';
import { appendAuditEntry, createAuditEntry, loadAuditTrail } from '../src/utils/auditTrail.js';
import {
  assessComparisonQuality,
  validateAnnualComparison,
  validateSeriesCompatibility,
  causalAssumptionRegistry
} from '../src/utils/comparisonGovernance.js';
import { assessDataQuality } from '../src/utils/dataQuality.js';
import {
  buildPilotDemoBriefing,
  formatPilotDemoBriefing,
  pilotDemoPreset
} from '../src/utils/pilotDemo.js';

const parameters = {
  inflationTarget: 2,
  dividendReactivity: 0.02,
  taxIntensity: 2.5,
  emergencyTaxThreshold: 5,
  wellbeingWeight: 0.6,
  equalityWeight: 0.4
};

const initialState = {
  inflation: 1.5,
  dividend: 1000,
  taxRate: 5,
  creditVolume: 100,
  wellbeing: 75,
  inequality: 40
};

test('generates three finite projections after simulation data', () => {
  let state = initialState;
  const history = [];

  for (let month = 0; month < 3; month += 1) {
    const inflation = simulateInflation(
      state.inflation,
      scenarios.normal,
      month,
      state,
      parameters
    );
    state = calculateAdjustments(inflation, state, parameters);
    history.push({ month, ...state });
  }

  const projections = generatePredictions(history, scenarios.normal, parameters);

  assert.equal(projections.length, 3);
  assert.deepEqual(projections.map(({ month }) => month), [3, 4, 5]);
  assert.ok(projections.every(({ inflation, wellbeing }) => (
    Number.isFinite(inflation) && Number.isFinite(wellbeing)
  )));
  assert.ok(projections.every((prediction) => (
    prediction.lowerBound <= prediction.inflation &&
    prediction.inflation <= prediction.upperBound &&
    prediction.probabilityAboveTarget >= 0 &&
    prediction.probabilityAboveTarget <= 100
  )));
});

test('applies social-priority controls to the calculated state', () => {
  const baseline = calculateAdjustments(3, initialState, parameters);
  const equalityPriority = calculateAdjustments(3, initialState, {
    ...parameters,
    equalityWeight: 1
  });
  const wellbeingPriority = calculateAdjustments(3, initialState, {
    ...parameters,
    wellbeingWeight: 1
  });

  assert.notEqual(equalityPriority.inequality, baseline.inequality);
  assert.notEqual(wellbeingPriority.wellbeing, baseline.wellbeing);
});

test('keeps inflation inside configured simulation bounds', () => {
  const inflation = simulateInflation(
    9.5,
    scenarios.hyperinflation,
    5,
    initialState,
    parameters
  );

  assert.equal(inflation, 10);
});

test('resets all simulation results when selecting a new scenario', () => {
  const advancedState = simulationReducer(
    simulationReducer(createInitialSimulationState(), { type: 'SIMULATE_MONTH' }),
    { type: 'SIMULATE_MONTH' }
  );
  const selectedState = simulationReducer(advancedState, {
    type: 'SELECT_SCENARIO',
    scenario: 'crisis'
  });

  assert.equal(selectedState.scenario, 'crisis');
  assert.equal(selectedState.isRunning, false);
  assert.equal(selectedState.currentMonth, 0);
  assert.deepEqual(selectedState.data, []);
  assert.deepEqual(selectedState.predictions, []);
  assert.deepEqual(selectedState.currentState, initialState);
});

test('stops automatically at the simulation horizon', () => {
  const state = {
    ...createInitialSimulationState(),
    isRunning: true,
    currentMonth: 23
  };
  const completedState = simulationReducer(state, { type: 'SIMULATE_MONTH' });

  assert.equal(completedState.currentMonth, 24);
  assert.equal(completedState.isRunning, false);
  assert.equal(completedState.data.length, 1);
});

test('parses France and euro area inflation from Eurostat JSON-stat data', () => {
  const dataset = {
    id: ['freq', 'unit', 'coicop18', 'geo', 'time'],
    size: [1, 1, 1, 2, 2],
    updated: '2026-09-01T23:00:00+0200',
    dimension: {
      geo: { category: { index: { EA20: 0, FR: 1 } } },
      time: { category: { index: { '2026-07': 0, '2026-08': 1 } } }
    },
    value: { 0: 2, 1: 2.1, 2: 0.8, 3: 0.6 }
  };

  assert.deepEqual(parseEurostatInflation(dataset), {
    updatedAt: '2026-09-01T23:00:00+0200',
    inflation: {
      EA20: [
        { period: '2026-07', value: 2 },
        { period: '2026-08', value: 2.1 }
      ],
      FR: [
        { period: '2026-07', value: 0.8 },
        { period: '2026-08', value: 0.6 }
      ]
    }
  });
});

test('parses JSON-stat coordinates when geography is not adjacent to time', () => {
  const dataset = {
    id: ['freq', 'geo', 'unit', 'time'],
    size: [1, 2, 1, 2],
    dimension: {
      geo: { category: { index: { FR: 0, EA20: 1 } } },
      time: { category: { index: { '2026-Q1': 0, '2026-Q2': 1 } } }
    },
    value: { 0: 0.2, 1: 0.4, 2: 0.3, 3: 0.5 }
  };

  assert.deepEqual(parseEurostatGeoTimeSeries(dataset, ['freq', 'unit', 'geo', 'time']), {
    FR: [{ period: '2026-Q1', value: 0.2 }, { period: '2026-Q2', value: 0.4 }],
    EA20: [{ period: '2026-Q1', value: 0.3 }, { period: '2026-Q2', value: 0.5 }]
  });
});

test('parses ECB SDMX-JSON observations into ordered series', () => {
  const dataset = {
    header: { prepared: '2026-09-03T00:00:00Z' },
    dataSets: [{ series: { '0': { observations: { 1: [2.5], 0: [2] } } } }],
    structure: {
      dimensions: {
        observation: [{ values: [{ id: '2026-07' }, { id: '2026-08' }] }]
      }
    }
  };

  assert.deepEqual(parseEcbSdmxSeries(dataset), {
    updatedAt: '2026-09-03T00:00:00Z',
    series: [[{ period: '2026-07', value: 2 }, { period: '2026-08', value: 2.5 }]]
  });
});

test('parses and aligns only common annual World Bank observations', () => {
  const parsed = parseWorldBankAnnualSeries([
    { lastupdated: '2026-07-13' },
    [
      { countryiso3code: 'WLD', date: '2024', value: 3.2 },
      { countryiso3code: 'FRA', date: '2024', value: 1.7 },
      { countryiso3code: 'FRA', date: '2023', value: 5.7 },
      { countryiso3code: 'WLD', date: '2022', value: 8.1 },
      { countryiso3code: 'FRA', date: '2021', value: null }
    ]
  ], ['FRA', 'WLD']);

  assert.deepEqual(parsed, {
    updatedAt: '2026-07-13',
    series: {
      FRA: [{ period: '2023', value: 5.7 }, { period: '2024', value: 1.7 }],
      WLD: [{ period: '2022', value: 8.1 }, { period: '2024', value: 3.2 }]
    }
  });
  assert.deepEqual(alignAnnualSeries(parsed.series.FRA, parsed.series.WLD), [
    { period: '2024', left: 1.7, right: 3.2 }
  ]);
});

test('extends the historical inflation curve with simulated months', () => {
  const chartData = buildInflationComparisonData(
    [
      { period: '2026-07', value: 0.8 },
      { period: '2026-08', value: 0.6 }
    ],
    [
      { period: '2026-07', value: 2 },
      { period: '2026-08', value: 2.1 }
    ],
    [{ inflation: 1.2 }, { inflation: 1.5 }]
  );

  assert.deepEqual(chartData, [
    { period: '2026-07', france: 0.8, euroArea: 2 },
    { period: '2026-08', france: 0.6, euroArea: 2.1, simulation: 0.6 },
    { period: '2026-09', simulation: 1.2 },
    { period: '2026-10', simulation: 1.5 }
  ]);
});

test('calibrates inflation from aligned France and euro area observations', () => {
  const france = Array.from({ length: 12 }, (_, index) => ({
    period: `2025-${String(index + 1).padStart(2, '0')}`,
    value: 1 + index * 0.1
  }));
  const euroArea = france.map(({ period, value }) => ({
    period,
    value: value + 0.4
  }));

  const calibration = calibrateInflation(france, euroArea);

  assert.equal(calibration.observationCount, 12);
  assert.equal(calibration.lastPeriod, '2025-12');
  assert.ok(calibration.referenceInflation > 1);
  assert.ok(calibration.meanReversion >= 0.05);
  assert.ok(calibration.meanReversion <= 0.5);
  assert.ok(calibration.monthlyVolatility > 0);
});

test('backtests one-month inflation predictions using past observations only', () => {
  const france = Array.from({ length: 30 }, (_, index) => ({
    period: `${2024 + Math.floor(index / 12)}-${String(index % 12 + 1).padStart(2, '0')}`,
    value: 1.5 + index * 0.03
  }));
  const euroArea = france.map(({ period, value }) => ({
    period,
    value: value + 0.2
  }));

  const backtest = evaluateInflationBacktest(france, euroArea);

  assert.equal(backtest.results.length, 6);
  assert.ok(backtest.meanAbsoluteError >= 0);
  assert.ok(backtest.intervalCoverage >= 0);
  assert.ok(backtest.intervalCoverage <= 100);
  assert.ok(backtest.results.every(({ actual, prediction }) => (
    Number.isFinite(actual) && Number.isFinite(prediction)
  )));
});

test('compares forecast models through a common contract and weights validated recent errors', () => {
  const france = Array.from({ length: 40 }, (_, index) => ({
    period: `${2023 + Math.floor(index / 12)}-${String(index % 12 + 1).padStart(2, '0')}`,
    value: 1.4 + index * 0.04 + (index % 3 === 0 ? 0.08 : 0)
  }));
  const euroArea = france.map(({ period, value }, index) => ({
    period,
    value: value + 0.25 + (index % 4 === 0 ? 0.03 : 0)
  }));
  const comparison = buildForecastComparison(france, euroArea);

  assert.equal(comparison.observationCount, 40);
  assert.equal(comparison.models.length, 3);
  assert.ok(comparison.models.every(({ id, status, limitation }) => id && status && limitation));
  assert.ok(comparison.models.every(({ forecast }) => (
    forecast && Number.isFinite(forecast.point) && forecast.lowerBound <= forecast.point
  )));
  assert.equal(comparison.ensemble.status, 'available');
  const weightedModels = comparison.models.filter(({ weight }) => weight !== null);
  assert.ok(weightedModels.every(({ backtest }) => backtest.results.length >= 12));
  assert.ok(Math.abs(weightedModels.reduce((sum, { weight }) => sum + weight, 0) - 1) < 1e-10);
});

test('does not label the local multivariate prototype as a BVAR or fabricate availability', () => {
  const france = Array.from({ length: 16 }, (_, index) => ({
    period: `2025-${String(index + 1).padStart(2, '0')}`,
    value: 1 + index * 0.1
  }));
  const euroArea = france.map(({ period, value }) => ({ period, value: value + 0.2 }));
  const comparison = buildForecastComparison(france, euroArea);
  const prototype = comparison.models.find(({ id }) => id === 'regularized-mar-educational');

  assert.equal(prototype.status, 'unavailable');
  assert.match(prototype.label, /autorégressif multivarié régularisé/);
  assert.match(prototype.limitation, /Ce n’est pas un BVAR/);
  assert.deepEqual(alignForecastObservations(france, euroArea).length, 16);
});

test('compares a reference policy with an alternative over twelve months', () => {
  const comparison = comparePolicyScenarios(
    initialState,
    scenarios.normal,
    parameters,
    { ...parameters, taxIntensity: 4, dividendReactivity: 0.04 },
    0
  );

  assert.equal(comparison.reference.length, 12);
  assert.equal(comparison.alternative.length, 12);
  assert.ok(Number.isFinite(comparison.delta.inflation));
  assert.ok(Number.isFinite(comparison.delta.wellbeing));
});

test('creates a custom scenario with an explicit trend and shock', () => {
  const scenario = buildCustomScenario(scenarios.normal, {
    ...defaultScenarioAdjustments,
    trendAdjustment: 0.2,
    shockMonth: 4,
    shockIntensity: 1.5
  });

  assert.equal(scenario.inflationTrend[0], scenarios.normal.inflationTrend[0] + 0.2);
  assert.deepEqual(scenario.shocks.at(-1), {
    month: 4,
    intensity: 1.5,
    type: 'choc de politique publique'
  });
  assert.equal(scenario.expectedValues, null);
});

test('blocks decision support for stale data or failed conservative backtest thresholds', () => {
  const readiness = evaluateDecisionReadiness({
    sourceStatus: 'ready',
    sourceUpdatedAt: '2026-06-01T00:00:00Z',
    calibration: { observationCount: 60 },
    backtest: { results: Array(12), meanAbsoluteError: 1.6, intervalCoverage: 70 },
    now: new Date('2026-09-03T00:00:00Z')
  });

  assert.equal(readiness.eligible, false);
  assert.equal(readiness.checks.find(({ id }) => id === 'freshness').passed, false);
  assert.equal(readiness.checks.find(({ id }) => id === 'backtest-error').passed, false);
});

test('produces an explicitly independent persistence benchmark and conditional support', () => {
  const calibration = {
    observationCount: 60,
    referenceInflation: 2,
    meanReversion: 0.2,
    latestFranceInflation: 3,
    latestEuroAreaInflation: 2.3
  };
  const benchmark = buildForecastBenchmark(calibration);
  const readiness = evaluateDecisionReadiness({
    sourceStatus: 'ready',
    sourceUpdatedAt: '2026-09-01T00:00:00Z',
    calibration,
    backtest: { results: Array(12), meanAbsoluteError: 0.4, intervalCoverage: 80 },
    now: new Date('2026-09-03T00:00:00Z')
  });
  const support = buildDecisionSupport({
    readiness,
    benchmark,
    currentState: initialState,
    parameters,
    scenarioName: 'Situation normale',
    alternatives: []
  });

  assert.equal(benchmark.persistence, 3);
  assert.equal(benchmark.calibrated, 2.8);
  assert.equal(benchmark.materialDisagreement, false);
  assert.equal(support.eligible, true);
  assert.match(support.conditionalOutput, /^Si les hypothèses/);
});

test('keeps audit entries in supplied local storage and retains decision context', () => {
  const store = new Map();
  const storage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, value) => store.set(key, value)
  };
  const entry = createAuditEntry({
    scenario: 'normal',
    parameters,
    sourceUpdatedAt: '2026-09-01T00:00:00Z',
    recommendation: 'Sortie conditionnelle.',
    eligible: true
  });

  const entries = appendAuditEntry(entry, storage);

  assert.equal(entries.length, 1);
  assert.deepEqual(loadAuditTrail(storage)[0].configuration, parameters);
  assert.equal(loadAuditTrail(storage)[0].dataSourceUpdatedAt, '2026-09-01T00:00:00Z');
});

test('rejects unvalidated annual geography-indicator combinations and incompatible series', () => {
  assert.equal(validateAnnualComparison('franceWorld', 'debt').compatible, false);
  assert.equal(validateAnnualComparison('franceEurope', 'debt').compatible, true);
  const incompatible = validateSeriesCompatibility(
    { definition: 'IPCH', frequency: 'monthly', unit: '%', geographyFramework: 'EU' },
    { definition: 'IPC', frequency: 'annual', unit: '%', geographyFramework: 'world' }
  );

  assert.equal(incompatible.compatible, false);
  assert.deepEqual(incompatible.mismatches, ['definition', 'frequency', 'geographyFramework']);
});

test('qualifies aligned comparison uncertainty without presenting it as a forecast', () => {
  const quality = assessComparisonQuality([
    { period: '2020', left: 2, right: 1 },
    { period: '2021', left: 4, right: 2 },
    { period: '2022', left: 5, right: 3 },
    { period: '2023', left: 3, right: 2 }
  ], '2026-09-01');

  assert.equal(quality.observationCount, 4);
  assert.deepEqual(quality.uncertainty, {
    lower: 1,
    upper: 2,
    label: 'Fourchette interquartile des écarts annuels observés'
  });
  assert.match(quality.limitation, /pas un intervalle de confiance/);
});

test('documents every programmed causal assumption as heuristic and limited', () => {
  assert.ok(causalAssumptionRegistry.length >= 3);
  assert.ok(causalAssumptionRegistry.every(({ lag, evidence, limitation }) => (
    lag && evidence.includes('heuristique') || limitation.includes('validation causale')
  )));
});

test('classifies source freshness without inventing data availability', () => {
  const now = Date.now;
  Date.now = () => new Date('2026-09-03T00:00:00Z').getTime();
  try {
    assert.equal(assessDataQuality({ status: 'ready' }, '2026-09-01T00:00:00Z').level, 'current');
    assert.equal(assessDataQuality({ status: 'ready' }, '2026-08-01T00:00:00Z').level, 'delayed');
    assert.equal(assessDataQuality({ status: 'ready' }, '2026-06-01T00:00:00Z').level, 'stale');
    assert.equal(assessDataQuality({ status: 'error' }, '2026-09-01T00:00:00Z').level, 'incomplete');
  } finally {
    Date.now = now;
  }
});

import { getNextWorkspace, workspaceTabs } from '../src/utils/workspaces.js';

test('cycles workspaces with standard tablist navigation keys', () => {
  assert.equal(workspaceTabs.length, 5);
  assert.equal(getNextWorkspace('overview', 'ArrowLeft'), 'methodology-audit');
  assert.equal(getNextWorkspace('methodology-audit', 'ArrowRight'), 'overview');
  assert.equal(getNextWorkspace('scenarios', 'Home'), 'overview');
  assert.equal(getNextWorkspace('scenarios', 'End'), 'methodology-audit');
  assert.equal(getNextWorkspace('scenarios', 'Enter'), null);
});

test('builds a constrained twelve-month energy shock pilot briefing', () => {
  const briefing = buildPilotDemoBriefing({
    initialState,
    parameters,
    inflationSource: { status: 'ready', data: { updatedAt: new Date().toISOString() } },
    unemploymentSource: { status: 'error', data: null }
  });
  const text = formatPilotDemoBriefing(briefing, {
    inflationUpdatedAt: '2026-09-01T00:00:00Z',
    unemploymentUpdatedAt: null
  });

  assert.equal(pilotDemoPreset.scenarioId, 'inflation');
  assert.equal(pilotDemoPreset.horizonMonths, 12);
  assert.equal(briefing.comparison.reference.length, 12);
  assert.equal(briefing.comparison.alternative.length, 12);
  assert.match(text, /choc de prix de l’énergie/i);
  assert.match(text, /Emploi : non simulé/);
  assert.match(text, /non certifié/i);
  assert.match(text, /QUESTION POUR LA PROCHAINE DÉCISION/);
});
