'use client'

import type { FindPlaceFromTextResponseData } from "@googlemaps/google-maps-services-js";
import { Loader } from "@googlemaps/js-api-loader";
import { FormEvent, useEffect } from "react";

export function NewRoutePage() {


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
    const directionsData = await directionsResponse.json();
    console.log(directionsData);

  }
  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%' }}>
      <div>
        <h1>Nova Rota</h1>
        <form style={{ display: "flex", flexDirection: "column" }} onSubmit={searchPlaces}>
          <div>
            <input id="source" type="text" placeholder="origem" />
          </div>
          <div>
            <input id="destination" type="text" placeholder="destino" />
          </div>
          <button type="submit">Pesquisar</button>
        </form>
      </div>
      <div id="map" style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
}

export default NewRoutePage;
