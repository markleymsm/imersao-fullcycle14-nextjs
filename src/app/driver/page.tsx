'use client'

import { useRef } from "react";
import { useMap } from "../hooks/userMap";
import useSwr from "swr";
import { fetcher } from "../utils/http";
import { Route } from "../utils/models";

export function DriverPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);

  const {
    data: routes,
    error,
    isLoading,
  } = useSwr<Route[]>("http://localhost:3000/routes", fetcher, {
    fallbackData: [],
  });

  async function startRoute() {
    const routeId = (document.getElementById("route") as HTMLSelectElement).value;
    const response = await fetch(`http://localhost:3000/routes/${routeId}`)
    const route: Route = await response.json();
    map?.removeAllRoutes();
    await map?.addRouteWithIcons({
      routeId: routeId,
      startMarkerOptions: {
        position: route.directions.routes[0].legs[0].start_location,
      },
      endMarkerOptions: {
        position: route.directions.routes[0].legs[0].end_location,
      },
      carMarkerOptions: {
        position: route.directions.routes[0].legs[0].start_location,
      },
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%' }}>
      <div>
        <h1>Minha viagem</h1>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <select id="route">
            {isLoading && <option>Carregando...</option>}
            {routes!.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>
          <button type="submit" onClick={startRoute}>Iniciar viagem</button>
        </div>
      </div>
      <div id="map" style={{ height: '100%', width: '100%' }} ref={mapContainerRef}></div>
    </div>
  );
}

export default DriverPage;
