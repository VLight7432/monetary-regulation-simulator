import { useCallback, useEffect, useReducer } from 'react';
import { scenarios } from '../data/scenarios.js';
import {
  calculateAdjustments,
  generatePredictions,
  simulateInflation
} from '../utils/calculations.js';

export const defaultParameters = {
  inflationTarget: 2.0,
  dividendReactivity: 0.02,
  taxIntensity: 2.5,
  emergencyTaxThreshold: 5.0,
  wellbeingWeight: 0.6,
  equalityWeight: 0.4
};

const defaultAlertThresholds = {
  inflation: { min: -1, max: 5 },
  wellbeing: { min: 50, max: 100 },
  inequality: { min: 20, max: 60 }
};

export const initialEconomicState = {
  inflation: 1.5,
  dividend: 1000,
  taxRate: 5,
  creditVolume: 100,
  wellbeing: 75,
  inequality: 40
};

export const createInitialSimulationState = () => ({
  isRunning: false,
  currentMonth: 0,
  scenario: 'normal',
  scenarioData: scenarios.normal,
  data: [],
  currentState: { ...initialEconomicState },
  parameters: { ...defaultParameters },
  alertThresholds: {
    inflation: { ...defaultAlertThresholds.inflation },
    wellbeing: { ...defaultAlertThresholds.wellbeing },
    inequality: { ...defaultAlertThresholds.inequality }
  },
  predictions: [],
  inflationCalibration: null
});

const resetSimulation = (state, scenario = state.scenario) => ({
  ...state,
  isRunning: false,
  currentMonth: 0,
  scenario,
  data: [],
  currentState: { ...initialEconomicState },
  predictions: []
});

export const simulationReducer = (state, action) => {
  switch (action.type) {
    case 'SIMULATE_MONTH': {
      if (state.currentMonth >= 24) {
        return { ...state, isRunning: false };
      }

      const scenarioData = state.scenarioData;
      if (!scenarioData) {
        throw new Error(`Scénario inconnu : ${state.scenario}`);
      }

      const inflation = simulateInflation(
        state.currentState.inflation,
        scenarioData,
        state.currentMonth,
        state.currentState,
        {
          ...state.parameters,
          inflationCalibration: state.inflationCalibration
        }
      );
      const currentState = calculateAdjustments(
        inflation,
        state.currentState,
        state.parameters
      );
      const data = [...state.data, { month: state.currentMonth, ...currentState }];

      return {
        ...state,
        isRunning: state.currentMonth + 1 < 24,
        currentMonth: state.currentMonth + 1,
        currentState,
        data,
        predictions: data.length >= 3
          ? generatePredictions(data, scenarioData, {
            ...state.parameters,
            inflationCalibration: state.inflationCalibration
          })
          : []
      };
    }
    case 'SET_RUNNING':
      return { ...state, isRunning: action.isRunning && state.currentMonth < 24 };
    case 'SELECT_SCENARIO':
      return {
        ...resetSimulation(state, action.scenario),
        scenarioData: scenarios[action.scenario]
      };
    case 'UPDATE_SCENARIO_DESIGN':
      return resetSimulation({
        ...state,
        scenarioData: action.scenarioData
      });
    case 'RESET':
      return resetSimulation(state);
    case 'UPDATE_PARAMETERS':
      return { ...state, parameters: action.parameters };
    case 'UPDATE_ALERT_THRESHOLDS':
      return { ...state, alertThresholds: action.alertThresholds };
    case 'SET_REFERENCE_INFLATION':
      if (state.currentMonth !== 0 || state.data.length !== 0) {
        return state;
      }

      return {
        ...state,
        currentState: { ...state.currentState, inflation: action.inflation }
      };
    case 'SET_INFLATION_CALIBRATION':
      if (state.currentMonth !== 0 || state.data.length !== 0) {
        return state;
      }

      return { ...state, inflationCalibration: action.calibration };
    default:
      return state;
  }
};

export const useSimulation = () => {
  const [state, dispatch] = useReducer(
    simulationReducer,
    undefined,
    createInitialSimulationState
  );

  const setIsRunning = useCallback((isRunning) => {
    dispatch({ type: 'SET_RUNNING', isRunning });
  }, []);

  const setScenario = useCallback((scenario) => {
    if (!scenarios[scenario]) {
      throw new Error(`Scénario inconnu : ${scenario}`);
    }

    dispatch({ type: 'SELECT_SCENARIO', scenario });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const updateParameters = useCallback((parameters) => {
    dispatch({ type: 'UPDATE_PARAMETERS', parameters });
  }, []);

  const updateAlertThresholds = useCallback((alertThresholds) => {
    dispatch({ type: 'UPDATE_ALERT_THRESHOLDS', alertThresholds });
  }, []);

  const setReferenceInflation = useCallback((inflation) => {
    if (!Number.isFinite(inflation)) {
      throw new Error('La référence d’inflation doit être un nombre fini.');
    }

    dispatch({ type: 'SET_REFERENCE_INFLATION', inflation });
  }, []);

  const updateScenarioDesign = useCallback((scenarioData) => {
    if (!scenarioData || !Array.isArray(scenarioData.inflationTrend)) {
      throw new Error('Le scénario personnalisé est invalide.');
    }

    dispatch({ type: 'UPDATE_SCENARIO_DESIGN', scenarioData });
  }, []);

  const setInflationCalibration = useCallback((calibration) => {
    if (
      !calibration ||
      !Number.isFinite(calibration.referenceInflation) ||
      !Number.isFinite(calibration.meanReversion)
    ) {
      throw new Error('La calibration d’inflation est invalide.');
    }

    dispatch({ type: 'SET_INFLATION_CALIBRATION', calibration });
  }, []);

  useEffect(() => {
    if (!state.isRunning) {
      return undefined;
    }

    const interval = setInterval(() => {
      dispatch({ type: 'SIMULATE_MONTH' });
    }, 800);

    return () => clearInterval(interval);
  }, [state.isRunning]);

  return {
    ...state,
    setIsRunning,
    setScenario,
    reset,
    updateParameters,
    updateAlertThresholds,
    setReferenceInflation,
    setInflationCalibration,
    updateScenarioDesign
  };
};

export default {
  calculateAdjustments,
  simulateInflation
};
