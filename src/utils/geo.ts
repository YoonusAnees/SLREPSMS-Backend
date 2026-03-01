export function pointGeoJSON(lng: number, lat: number): { type: "Point"; coordinates: [number, number] } {
  return { type: "Point", coordinates: [lng, lat] };
}