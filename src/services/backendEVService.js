import { fetchStationsNearPoint } from "./evStationsApi";

export async function getStations(lat, lng) {
  return fetchStationsNearPoint(lat, lng);
}
