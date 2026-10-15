// Single Source of Truth for Database Statistics across AamarPujo
import { PANDALS_DATA } from './pandalsData';
import { RESTAURANTS_DATA } from './restaurantsData';

export const TOTAL_PANDALS_COUNT = PANDALS_DATA.length;       // Exactly 541
export const TOTAL_RESTAURANTS_COUNT = RESTAURANTS_DATA.length; // Exactly 228

export const PANDALS_LABEL = `${TOTAL_PANDALS_COUNT}+`;         // "541+"
export const RESTAURANTS_LABEL = `${TOTAL_RESTAURANTS_COUNT}+`; // "228+"

export const DATASET_STATS = {
  pandals: TOTAL_PANDALS_COUNT,
  pandalsLabel: PANDALS_LABEL,
  restaurants: TOTAL_RESTAURANTS_COUNT,
  restaurantsLabel: RESTAURANTS_LABEL,
  districts: 23,
  metroStations: 24,
  days: 11
};

export default DATASET_STATS;
