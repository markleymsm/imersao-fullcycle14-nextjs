'use client'

import type { DirectionsResponseData, FindPlaceFromTextResponseData } from "@googlemaps/google-maps-services-js";
import { FormEvent, useRef, useState } from "react";
import { useMap } from "../hooks/userMap";
import useSwr from "swr";
import { fetcher } from "../utils/http";
import { Route } from "../utils/models";

export function DriverPage() {

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);
  const [directionsData, setDirectionsData] = useState<DirectionsResponseData & { request: any }>();

  const {
    data: routes,
    error,
    isLoading,
  } = useSwr<Route[]>("http://localhost:3000/routes", fetcher, {
    fallbackData: [],
  });

  async function searchPlaces(event: FormEvent) {
    event.preventDefault();
    const source = (document.getElementById("source") as HTMLInputElement).value;
    const destination = (document.getElementById("destination") as HTMLInputElement).value;

    const [sourceResponse, destinationResponse] = await Promise.all([
      fetch(`http://localhost:3000/places?text=${source}`),
      fetch(`http://localhost:3000/places?text=${destination}`),
    ]);

    const [sourcePlace, destinationPlace]: FindPlaceFromTextResponseData[] = await Promise.all([
      sourceResponse.json(),
      destinationResponse.json(),
    ]);

    if (sourcePlace.status !== "OK") {
      alert("Não foi possivel carregar a origem");
      return;
    }
    if (destinationPlace.status !== "OK") {
      alert("Não foi possivel carregar o destino");
      return;
    }

    const placeSourceId = sourcePlace.candidates[0].place_id;
    const placeDestinationId = destinationPlace.candidates[0].place_id;

    const directionsResponse = await fetch(`http://localhost:3000/directions?originId=${placeSourceId}&destinationId=${placeDestinationId}`);
    const directionsData: DirectionsResponseData & { request: any } = await directionsResponse.json();

    setDirectionsData(directionsData);

    map?.removeAllRoutes();

    await map?.addRouteWithIcons({
      routeId: '1',
      startMarkerOptions: {
        position: directionsData.routes[0].legs[0].start_location,
      },
      endMarkerOptions: {
        position: directionsData.routes[0].legs[0].end_location,
      },
      carMarkerOptions: {
        position: directionsData.routes[0].legs[0].start_location,
      }
    })
  }

  async function createRoute() {
    const startAddress = directionsData!.routes[0].legs[0].start_address;
    const endAddress = directionsData!.routes[0].legs[0].end_address;
    const response = await fetch('http://localhost:3000/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'aplication/json'
      },
      body: JSON.stringify({
        name: `${startAddress} - ${endAddress}`,
        source_id: directionsData!.request.origin.place_id,
        destination_id: directionsData!.request.destination.place_id,
      })
    });
    const route = await response.json();
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
          <button type="submit">Iniciar viagem</button>
        </div>
      </div>
      <div id="map" style={{ height: '100%', width: '100%' }} ref={mapContainerRef}></div>
    </div>
  );
}

export default DriverPage;
