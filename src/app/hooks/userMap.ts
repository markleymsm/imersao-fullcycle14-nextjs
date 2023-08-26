import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useState } from "react";
import { getCurrentPosition } from "../utils/geolocation";
import { Map } from "../utils/map";

export function useMap(containerRef: React.RefObject<HTMLDivElement>) {
  const [map, setMap] = useState<Map>();


  useEffect(() => {
    (async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries: ['routes', 'geometry']
      });
      await Promise.all([
        loader.importLibrary("routes"),
        loader.importLibrary("routes"),
        getCurrentPosition({ enableHighAccuracy: true })
      ]);
      const map = new Map(containerRef.current!, {
        zoom: 15,
        center: { lat: -23.5505, lng: -49.6333 }
      });
      setMap(map);
    })();
  }, [containerRef]);

  return map;
}
