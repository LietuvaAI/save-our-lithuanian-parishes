declare module "d3-geo" {
  export type GeoProjection = {
    (point: [number, number]): [number, number] | null;
    scale(value: number): GeoProjection;
    translate(value: [number, number]): GeoProjection;
  };

  export function geoAlbersUsa(): GeoProjection;
}
