export function pointWkt(lng: number, lat: number) {
  // PostGIS expects POINT(lng lat)
  return `POINT(${lng} ${lat})`;
}