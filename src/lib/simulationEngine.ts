// Core simulation engine for the nuclear power plant dashboard

// Types definitions for different metrics
export interface ReactorMetrics {
  coreTemperature: number; // in Celsius
  primaryLoopPressure: number; // in MPa
  coolantFlowRate: number; // in m³/h
  fuelBurnup: number; // percentage
  controlRodPositions: number[]; // percentage inserted (0-100)
  containmentPressure: number; // in kPa
  radiationLevel: number; // in mSv/h
  scramStatus: boolean;
  timeLastUpdated: Date;
}

export interface EnergyMixData {
  nuclear: number; // in MW
  solar: number; // in MW
  wind: number; // in MW
  hydro: number; // in MW
  demand: number; // in MW
  co2Avoided: number; // in tons
  timeLastUpdated: Date;
}

export interface ThermalEfficiencyData {
  heatRate: number; // in BTU/kWh
  turbineEfficiency: number; // percentage
  condenserVacuum: number; // in kPa
  feedwaterTemperature: number; // in Celsius
  ambientTemperature: number; // in Celsius
  coolingTowerEfficiency: number; // percentage
  timeLastUpdated: Date;
}

export interface WasteManagementData {
  fuelUsagePercentage: number; // percentage
  spentFuelPoolCapacity: number; // percentage
  spentFuelTemperature: number; // in Celsius
  dryCaskOccupancy: number; // number of casks filled
  wasteRadiationLevel: number; // in mSv/h
  timeLastUpdated: Date;
}

// Default starting values
const defaultReactorMetrics: ReactorMetrics = {
  coreTemperature: 320,
  primaryLoopPressure: 15.5,
  coolantFlowRate: 55000,
  fuelBurnup: 34,
  controlRodPositions: [65, 60, 70, 55, 62],
  containmentPressure: 101.3,
  radiationLevel: 0.12,
  scramStatus: false,
  timeLastUpdated: new Date(),
};

const defaultEnergyMix: EnergyMixData = {
  nuclear: 1000,
  solar: 200,
  wind: 300,
  hydro: 400,
  demand: 1700,
  co2Avoided: 1450,
  timeLastUpdated: new Date(),
};

const defaultThermalEfficiency: ThermalEfficiencyData = {
  heatRate: 10200,
  turbineEfficiency: 92,
  condenserVacuum: 5.1,
  feedwaterTemperature: 220,
  ambientTemperature: 25,
  coolingTowerEfficiency: 85,
  timeLastUpdated: new Date(),
};

const defaultWasteManagement: WasteManagementData = {
  fuelUsagePercentage: 34,
  spentFuelPoolCapacity: 45,
  spentFuelTemperature: 38,
  dryCaskOccupancy: 12,
  wasteRadiationLevel: 2.3,
  timeLastUpdated: new Date(),
};

// Alert thresholds
export const alertThresholds = {
  highCoreTemperature: 340, // Celsius
  highPrimaryPressure: 16.0, // MPa
  lowCoolantFlow: 50000, // m³/h
  highRadiation: 0.5, // mSv/h
  highContainmentPressure: 110, // kPa
};

// State variables
let currentReactorMetrics: ReactorMetrics = { ...defaultReactorMetrics };
let currentEnergyMix: EnergyMixData = { ...defaultEnergyMix };
let currentThermalEfficiency: ThermalEfficiencyData = { ...defaultThermalEfficiency };
let currentWasteManagement: WasteManagementData = { ...defaultWasteManagement };
let simulationMode: "live" | "training" = "live";
let emergencyScenarioActive = false;
let emergencyScenarioType: string | null = null;
let simulationTimeMultiplier = 1; // For accelerated simulation

// Helper function for controlled random changes
function controlledRandomChange(current: number, min: number, max: number, volatility: number): number {
  const change = ((Math.random() * 2) - 1) * volatility;
  let newValue = current + change;
  if (newValue < min) newValue = min;
  if (newValue > max) newValue = max;
  return parseFloat(newValue.toFixed(2));
}

// Simulation update function for reactor metrics
export function updateReactorMetrics(): ReactorMetrics {
  // Skip updates if in training mode
  if (simulationMode === "training") return currentReactorMetrics;

  const baseVolatility = emergencyScenarioActive ? 2.0 : 0.5; // Higher volatility during emergencies
  
  // Update each metric with controlled randomness
  let coreTemp = controlledRandomChange(
    currentReactorMetrics.coreTemperature, 
    315, 
    emergencyScenarioActive && emergencyScenarioType === 'LOCA' ? 380 : 330, 
    baseVolatility
  );
  
  let primaryPressure = controlledRandomChange(
    currentReactorMetrics.primaryLoopPressure, 
    15.0, 
    emergencyScenarioActive && emergencyScenarioType === 'LOCA' ? 16.5 : 15.8, 
    baseVolatility * 0.1
  );
  
  let coolantFlow = controlledRandomChange(
    currentReactorMetrics.coolantFlowRate, 
    emergencyScenarioActive && emergencyScenarioType === 'LOCA' ? 40000 : 52000, 
    58000, 
    baseVolatility * 100
  );
  
  // Slowly increase fuel burnup over time
  let burnup = currentReactorMetrics.fuelBurnup;
  if (Math.random() > 0.95) { // Occasionally increment burnup
    burnup += simulationTimeMultiplier * 0.01;
    if (burnup > 100) burnup = 100;
  }
  
  // Control rod positions change occasionally
  const newRodPositions = [...currentReactorMetrics.controlRodPositions];
  if (Math.random() > 0.8) {
    const rodIndex = Math.floor(Math.random() * newRodPositions.length);
    newRodPositions[rodIndex] = controlledRandomChange(newRodPositions[rodIndex], 0, 100, baseVolatility);
  }
  
  // Containment pressure and radiation level
  let containmentPressure = controlledRandomChange(
    currentReactorMetrics.containmentPressure, 
    100, 
    emergencyScenarioActive ? 115 : 103, 
    baseVolatility * 0.2
  );
  
  let radiationLevel = controlledRandomChange(
    currentReactorMetrics.radiationLevel, 
    0.1, 
    emergencyScenarioActive ? 0.8 : 0.15, 
    baseVolatility * 0.01
  );
  
  // SCRAM status based on thresholds
  const scramNeeded = 
    coreTemp > alertThresholds.highCoreTemperature ||
    primaryPressure > alertThresholds.highPrimaryPressure ||
    coolantFlow < alertThresholds.lowCoolantFlow ||
    radiationLevel > alertThresholds.highRadiation ||
    containmentPressure > alertThresholds.highContainmentPressure;
  
  // Update the current state
  currentReactorMetrics = {
    coreTemperature: coreTemp,
    primaryLoopPressure: primaryPressure,
    coolantFlowRate: coolantFlow,
    fuelBurnup: burnup,
    controlRodPositions: newRodPositions,
    containmentPressure: containmentPressure,
    radiationLevel: radiationLevel,
    scramStatus: scramNeeded,
    timeLastUpdated: new Date()
  };
  
  return { ...currentReactorMetrics };
}

// Simulation update function for energy mix
export function updateEnergyMix(): EnergyMixData {
  if (simulationMode === "training") return currentEnergyMix;

  // Time of day affects solar generation (simplified model)
  const hour = new Date().getHours();
  const solarFactor = hour >= 7 && hour <= 17 ? (1 - Math.abs(12 - hour) / 10) : 0.1;
  
  // Random fluctuations for wind
  const windFactor = controlledRandomChange(0.7, 0.3, 1.0, 0.1);
  
  const solar = controlledRandomChange(200 * solarFactor, 0, 300, 10);
  const wind = controlledRandomChange(300 * windFactor, 100, 500, 20);
  const hydro = controlledRandomChange(currentEnergyMix.hydro, 350, 450, 5);
  
  // Demand changes throughout the day
  const baselineDemand = 1500 + Math.sin((hour / 24) * 2 * Math.PI + Math.PI/2) * 300;
  const demand = controlledRandomChange(baselineDemand, 1400, 2000, 30);
  
  // Nuclear adjusts to meet demand after accounting for renewables
  let nuclear = demand - solar - wind - hydro;
  if (nuclear < 600) nuclear = 600; // Minimum nuclear output
  if (nuclear > 1200) nuclear = 1200; // Maximum nuclear output
  nuclear = parseFloat(nuclear.toFixed(0));
  
  // Calculate CO2 avoided (compared to if all energy was from coal)
  // Assuming coal produces ~820g CO2/kWh and this mix produces ~12g CO2/kWh
  const hourlyGeneration = nuclear + solar + wind + hydro;
  const co2Avoided = parseFloat((hourlyGeneration * 0.82).toFixed(0)); // in tons for the hour
  
  currentEnergyMix = {
    nuclear,
    solar,
    wind,
    hydro,
    demand,
    co2Avoided,
    timeLastUpdated: new Date()
  };
  
  return { ...currentEnergyMix };
}

// Simulation update function for thermal efficiency
export function updateThermalEfficiency(): ThermalEfficiencyData {
  if (simulationMode === "training") return currentThermalEfficiency;
  
  // Ambient temperature affects cooling tower efficiency
  const hour = new Date().getHours();
  const baselineTemp = 20 + Math.sin((hour / 24) * 2 * Math.PI) * 8; // Daily temperature cycle
  const ambientTemperature = controlledRandomChange(baselineTemp, 5, 35, 0.5);
  
  // Cooling tower efficiency decreases with higher ambient temperature
  const coolingFactor = 1 - (ambientTemperature - 15) / 40; // Lower efficiency as temperature rises
  const coolingTowerEfficiency = parseFloat((85 * coolingFactor).toFixed(1));
  
  // Heat rate and turbine efficiency are affected by cooling tower efficiency
  const heatRateBase = 10000;
  const heatRatePenalty = (85 - coolingTowerEfficiency) * 10;
  const heatRate = controlledRandomChange(heatRateBase + heatRatePenalty, 9800, 10600, 20);
  
  const turbineEfficiency = controlledRandomChange(
    92 - (85 - coolingTowerEfficiency) / 10, 
    88, 
    93, 
    0.1
  );
  
  // Other parameters
  const condenserVacuum = controlledRandomChange(currentThermalEfficiency.condenserVacuum, 4.8, 5.4, 0.05);
  
  // Feedwater temperature changes slowly
  const feedwaterTemperature = controlledRandomChange(
    currentThermalEfficiency.feedwaterTemperature,
    215,
    225,
    0.2
  );
  
  currentThermalEfficiency = {
    heatRate,
    turbineEfficiency,
    condenserVacuum,
    feedwaterTemperature,
    ambientTemperature,
    coolingTowerEfficiency,
    timeLastUpdated: new Date()
  };
  
  return { ...currentThermalEfficiency };
}

// Simulation update function for waste management
export function updateWasteManagement(): WasteManagementData {
  if (simulationMode === "training") return currentWasteManagement;
  
  // Fuel usage increases very slowly over time
  let fuelUsage = currentWasteManagement.fuelUsagePercentage;
  if (Math.random() > 0.98) { // Very occasionally increment fuel usage
    fuelUsage += simulationTimeMultiplier * 0.05;
    if (fuelUsage > 100) fuelUsage = 100;
  }
  
  // Spent fuel pool capacity increases when fuel usage reaches 100%
  let spentFuelCapacity = currentWasteManagement.spentFuelPoolCapacity;
  if (fuelUsage >= 100 && Math.random() > 0.9) {
    fuelUsage = 0; // Reset fuel usage
    spentFuelCapacity += 2; // Add to spent fuel pool
    if (spentFuelCapacity > 100) spentFuelCapacity = 100;
  }
  
  // Spent fuel temperature correlates with pool capacity
  const baseSpentTemp = 30 + (spentFuelCapacity / 100) * 15;
  const spentFuelTemperature = controlledRandomChange(baseSpentTemp, 25, 50, 0.2);
  
  // Dry cask occupancy increases when spent fuel pool is near capacity
  let dryCaskOccupancy = currentWasteManagement.dryCaskOccupancy;
  if (spentFuelCapacity > 90 && Math.random() > 0.8) {
    spentFuelCapacity -= 10; // Remove from pool
    dryCaskOccupancy += 1; // Add a cask
  }
  
  // Radiation levels correlate with spent fuel pool capacity
  const baseRadiation = 1 + (spentFuelCapacity / 100) * 3;
  const wasteRadiationLevel = controlledRandomChange(baseRadiation, 0.5, 5, 0.1);
  
  currentWasteManagement = {
    fuelUsagePercentage: parseFloat(fuelUsage.toFixed(2)),
    spentFuelPoolCapacity: parseFloat(spentFuelCapacity.toFixed(2)),
    spentFuelTemperature: parseFloat(spentFuelTemperature.toFixed(2)),
    dryCaskOccupancy,
    wasteRadiationLevel: parseFloat(wasteRadiationLevel.toFixed(2)),
    timeLastUpdated: new Date()
  };
  
  return { ...currentWasteManagement };
}

// Control functions for the simulation
export function setSimulationMode(mode: "live" | "training"): void {
  simulationMode = mode;
}

export function getSimulationMode(): "live" | "training" {
  return simulationMode;
}

export function activateEmergencyScenario(scenario: string): void {
  emergencyScenarioActive = true;
  emergencyScenarioType = scenario;
}

export function deactivateEmergencyScenario(): void {
  emergencyScenarioActive = false;
  emergencyScenarioType = null;
}

export function getEmergencyScenarioStatus(): { active: boolean, type: string | null } {
  return {
    active: emergencyScenarioActive,
    type: emergencyScenarioType
  };
}

export function setSimulationTimeMultiplier(multiplier: number): void {
  simulationTimeMultiplier = multiplier;
}

export function resetToDefaults(): void {
  currentReactorMetrics = { ...defaultReactorMetrics };
  currentEnergyMix = { ...defaultEnergyMix };
  currentThermalEfficiency = { ...defaultThermalEfficiency };
  currentWasteManagement = { ...defaultWasteManagement };
  deactivateEmergencyScenario();
}

export function setManualControlRodPosition(index: number, position: number): void {
  if (index >= 0 && index < currentReactorMetrics.controlRodPositions.length) {
    const newPositions = [...currentReactorMetrics.controlRodPositions];
    newPositions[index] = position;
    currentReactorMetrics.controlRodPositions = newPositions;
  }
}

// Initial data getters
export function getInitialReactorMetrics(): ReactorMetrics {
  return { ...currentReactorMetrics };
}

export function getInitialEnergyMix(): EnergyMixData {
  return { ...currentEnergyMix };
}

export function getInitialThermalEfficiency(): ThermalEfficiencyData {
  return { ...currentThermalEfficiency };
}

export function getInitialWasteManagement(): WasteManagementData {
  return { ...currentWasteManagement };
}
