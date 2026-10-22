import { calculateAdjustments, simulateInflation } from './calculations.js';

export const projectPolicyScenario = (
  currentState,
  scenarioData,
  parameters,
  startMonth,
  horizon = 12
) => {
  let state = { ...currentState };

  return Array.from({ length: horizon }, (_, index) => {
    const month = startMonth + index;
    const inflation = simulateInflation(
      state.inflation,
      scenarioData,
      month,
      state,
      parameters
    );
    state = calculateAdjustments(inflation, state, parameters);

    return { month: month + 1, ...state };
  });
};

export const comparePolicyScenarios = (
  currentState,
  scenarioData,
  referenceParameters,
  alternativeParameters,
  startMonth,
  horizon = 12
) => {
  const reference = projectPolicyScenario(
    currentState,
    scenarioData,
    referenceParameters,
    startMonth,
    horizon
  );
  const alternative = projectPolicyScenario(
    currentState,
    scenarioData,
    alternativeParameters,
    startMonth,
    horizon
  );

  return {
    reference,
    alternative,
    delta: ['inflation', 'dividend', 'taxRate', 'creditVolume', 'wellbeing', 'inequality']
      .reduce((result, indicator) => ({
        ...result,
        [indicator]: alternative.at(-1)[indicator] - reference.at(-1)[indicator]
      }), {})
  };
};
