
// Ocean coordinates are approximated by common ocean areas
const OCEAN_REGIONS = [
  // Pacific Ocean regions
  { minLat: -30, maxLat: 30, minLng: 150, maxLng: -150 },
  { minLat: 30, maxLat: 60, minLng: 140, maxLng: -140 },
  { minLat: -60, maxLat: -30, minLng: 150, maxLng: -150 },
  
  // Atlantic Ocean regions
  { minLat: -30, maxLat: 30, minLng: -70, maxLng: -10 },
  { minLat: 30, maxLat: 60, minLng: -80, maxLng: -5 },
  { minLat: -50, maxLat: -30, minLng: -60, maxLng: 20 },
  
  // Indian Ocean regions
  { minLat: -40, maxLat: 25, minLng: 40, maxLng: 110 },
  
  // Southern Ocean
  { minLat: -65, maxLat: -50, minLng: -180, maxLng: 180 },
];

/**
 * Generates random GPS coordinates in ocean areas
 */
export function generateRandomOceanCoordinates() {
  // Select a random ocean region
  const region = OCEAN_REGIONS[Math.floor(Math.random() * OCEAN_REGIONS.length)];
  
  // Generate random coordinates within the region
  const latitude = region.minLat + Math.random() * (region.maxLat - region.minLat);
  const longitude = region.minLng + Math.random() * (region.maxLng - region.minLng);
  
  // Return coordinates with 6 decimal places precision
  return {
    latitude: parseFloat(latitude.toFixed(6)),
    longitude: parseFloat(longitude.toFixed(6))
  };
}

/**
 * Stores a detection record in localStorage
 */
export function storeDetectionRecord(coordinates: { latitude: number; longitude: number }, plasticLevel: string, timestamp = new Date()) {
  // Get existing records
  const existingRecordsJSON = localStorage.getItem('plasticDetectionRecords');
  const existingRecords = existingRecordsJSON ? JSON.parse(existingRecordsJSON) : [];
  
  // Add new record
  const newRecord = {
    coordinates,
    plasticLevel,
    timestamp: timestamp.toISOString(),
  };
  
  // Save updated records
  const updatedRecords = [...existingRecords, newRecord];
  localStorage.setItem('plasticDetectionRecords', JSON.stringify(updatedRecords));
  
  return updatedRecords;
}

/**
 * Gets all stored detection records
 */
export function getAllDetectionRecords() {
  const recordsJSON = localStorage.getItem('plasticDetectionRecords');
  return recordsJSON ? JSON.parse(recordsJSON) : [];
}
