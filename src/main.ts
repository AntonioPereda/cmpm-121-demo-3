// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

// Style sheets
import "leaflet/dist/leaflet.css";
import "./style.css";

// Fix missing marker images
import "./leafletWorkaround.ts";

// Deterministic random number generator
import luck from "./luck.ts";

//random seed
import seedrandom from 'seedrandom';

//import board
import "./board.ts"
import { Board, CacheManager } from "./board.ts";

//import memento
import "./memento.ts"
import { CacheOriginator, Caretaker } from "./memento.ts";

//import UIManager
import { UIManager } from "./UIManager";



const seed_key = 'this is the seed value!';

const random = seedrandom(seed_key);

let watchId: any = null;

interface CacheView {
  rect: leaflet.Rectangle;
  data: {
      coins: number;
      cacheBank: coinInfo[];
  };
}

//make the map
let zoom = 19;
let degrees = 1e-4;
let area_size = 5;
let spawnrate = 0.07;

//making the caches
let caches: leaflet.Rectangle[] = [];
let globalCache: leaflet.Rectangle[] = [];
let B = new Board(1, area_size);
let cacheManager = new CacheManager();
let polyHist: any = [];

let prevLatLng;

//Oakes Marker
const Oakes_Class = leaflet.latLng(36.98949379578401, -122.06277128548504);


//player marker
const player = leaflet.marker(Oakes_Class);
player.bindTooltip("This is you");

//NullIsland
const NullIsland = leaflet.latLng(0,0);

const map = leaflet.map('map', {
  center: player.getLatLng(),
  zoom: zoom,
  minZoom: zoom-100,
  maxZoom: zoom,
  zoomControl: true,
  scrollWheelZoom: true,
});


//add details to the map
leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: zoom,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

//add player
player.addTo(map);

//Cache layer
const cacheMarkers = leaflet.layerGroup().addTo(map);

let origin = player.getLatLng();

let polyline = leaflet.polyline(polyHist, {color: 'red'}).addTo(map);

//point display
let points = 0;
const pointPannel = document.querySelector<HTMLDivElement>("#pointPannel")!;
pointPannel.style.fontSize = "50px";
pointPannel.innerHTML = "0";

//coin info
let pointBank: coinInfo[] = [];

interface coinInfo {
  i: number;
  j: number;
  serial: number;
}


function generateCache(i: number, j: number): void {
  //console.log(`Attempting to generate cache at tile offset (${i}, ${j})`);

  // Get the tile at the grid position
  const tile = B.getCellForPoint(
      leaflet.latLng(origin.lat + i * degrees, origin.lng + j * degrees)
  );

  //console.log(i, " vs ", tile.j);
  //console.log(tile.isOccupied);

  // Spawn cache if tile is unoccupied
  if (tile && !tile.isOccupied) {
      //console.log(`Spawning unoccupied @ (${tile.i}, ${tile.j})`);
      const cache = spawnCache(i, j); // Create cache

      cache.rect.addTo(cacheMarkers);

      // Mark as occupied, track it & add it
      tile.isOccupied = true;
      caches.push(cache.rect);
      globalCache.push(cache.rect);
      attachPopup(cache.rect, cache.data);
      //(`Cache spawned @ (${tile.i}, ${tile.j}). Marked as occupied.`);
  } else {
      //console.log(`Cant spawn cache: Tile (${i}, ${j}) is already occupied.`);
  }
}

//returns the nearby points of A
function findNearby(markerA: leaflet.Rectangle) {
  const retCaches: leaflet.Rectangle[] = [];

  const index = caches.findIndex((element) => markerA === element);
  if (index === -1) return retCaches; // Skip if the cache is not found

  for (
    let i = Math.max(0, index - 5);
    i <= Math.min(caches.length - 1, index + 5);
    i++
  ) {
    const cache = caches[i];
    if (cache) retCaches.push(cache); // Validate cache existence
  }
  return retCaches.flat();
}

//Checks if Player is within area_size of B
function checkPlayerDist(player: leaflet.Marker, cache: leaflet.Rectangle) {
  if (Array.isArray(cache)){
    return;
  }
  const playerLat = player.getLatLng().lat;
  const playerLng = player.getLatLng().lng;

  //console.log(cache);

  // Use .getBounds() then .getNorthEast() to retrieve the NE corner
  const cacheLat = cache.getBounds().getNorthEast().lat;
  const cacheLng = cache.getBounds().getNorthEast().lng;

  // Check if both lat and lng distances are within range
  return (
    Math.abs(playerLat - cacheLat) <= area_size * degrees &&
    Math.abs(playerLng - cacheLng) <= area_size * degrees
  );
}


function spawnCache(i, j): CacheView { 
  const cacheBank: coinInfo[] = [];
  const coins = Math.floor((luck([i, j].toString()) * 8 + 2));

  // Generate bounds for the rectangle
  const bounds = leaflet.latLngBounds([
      [NullIsland.lat + origin.lat + i * degrees, NullIsland.lng + origin.lng + j * degrees],
      [NullIsland.lat + origin.lat + (i + 0.45) * degrees, NullIsland.lng + origin.lng + (j + 0.55) * degrees]
  ]);


  const data = {
    coordinates: bounds,
    coins: coins,
    cacheBank: [],
  };

  // Create rectangle marker
  const rect = leaflet.rectangle(bounds);
  rect.addTo(cacheMarkers);

  // Generate cache-related data

  // Return cache data and the marker to be processed separately
  return {rect, data};
}



// attaches popup to cache
function attachPopup(rect: leaflet.Rectangle, data) {
  const popupDiv = document.createElement("div");
  popupDiv.innerHTML = `
      <div>This cache contains <span id="cacheCoins">${data.coins}</span> coins.</div>
      <button id="take">Take</button>
      <button id="place">Deposit</button>
  `;

  const takeButton = popupDiv.querySelector("#take")!;
  popupDiv.querySelector<HTMLButtonElement>("#take")!.style.color = "white";
  const depositButton = popupDiv.querySelector("#place")!;
  popupDiv.querySelector<HTMLButtonElement>("#place")!.style.color = "white";
  const coinCounter = popupDiv.querySelector("#cacheCoins")!;

  takeButton.addEventListener("click", () => {
      if (data.coins > 0) {
          data.coins--;
          points++;
          coinCounter.textContent = `${data.coins}`;
          pointPannel.innerHTML = `${points} coins accumulated`;
      } else {
          alert("The cache is empty!");
      }
  });

  depositButton.addEventListener("click", () => {
      if (points > 0) {
          points--;
          data.coins++;
          coinCounter.textContent = `${data.coins}`;
          pointPannel.innerHTML = `${points} coins accumulated`;
      } else {
          alert("You don't have any coins!");
      }
  });

  // Attach popup to the rectangle
  rect.bindPopup(popupDiv);
}




//UI Manager
const uiManager = new UIManager(() => {
  isGeolocationEnabled = !isGeolocationEnabled;
  if (isGeolocationEnabled) {
    startGeolocation();
    polyHist = [];
  } else {
    stopGeolocation();
  }
});

//Movement

let movementScale = 0.00005;
//let movementScale = 0.001;

uiManager.setMovementHandlers({
  up: () => {
    const i = player.getLatLng().lat;
    const j = player.getLatLng().lng;
    prevLatLng = leaflet.latLng(i, j);
    player.setLatLng(leaflet.latLng(i + movementScale, j));
    map.setView(player.getLatLng());
    spawnTheCaches();
  },
  down: () => {
    const i = player.getLatLng().lat;
    const j = player.getLatLng().lng;
    prevLatLng = leaflet.latLng(i, j);
    player.setLatLng(leaflet.latLng(i - movementScale, j));
    map.setView(player.getLatLng());
    spawnTheCaches();
  },
  left: () => {
    const i = player.getLatLng().lat;
    const j = player.getLatLng().lng;
    prevLatLng = leaflet.latLng(i, j);
    player.setLatLng(leaflet.latLng(i, j - movementScale));
    map.setView(player.getLatLng());
    spawnTheCaches();
  },
  right: () => {
    const i = player.getLatLng().lat;
    const j = player.getLatLng().lng;
    prevLatLng = leaflet.latLng(i, j);
    player.setLatLng(leaflet.latLng(i, j + movementScale));
    map.setView(player.getLatLng());
    spawnTheCaches();
  }
});





//update player location
let lastLat = null;
let lastLng = null;
const AREA = 1.35;
function updatePlayerLocation(lat, lng) {

    //polyline stuff

   // console.log(origin.lat, origin.lng);

    if (isGeolocationEnabled){
      console.log(lat, lng);
      player.setLatLng(leaflet.latLng(lat, lng));
    }
    origin = player.getLatLng();
    map.setView(origin, map.getZoom());
    polyHist.push(leaflet.latLng(origin.lat, origin.lng))
    map.removeLayer(polyline);
    polyline = new leaflet.polyline(polyHist, {color: 'red'}).addTo(map);
    console.log(polyHist);
    polyline.redraw();
}


//Spawn new caches
function spawnTheCaches() {
  //ALIGNS WITH THE PLAYER
  const OFFSET1 = 36.7
  const OFFSET2 = 122;

  cacheMarkers.clearLayers();

  updatePlayerLocation(origin.lat, origin.lng);

  const cachesToKeep: leaflet.Rectangle[] = [];
  caches.forEach((cache) => {
      if (checkPlayerDist(player, cache)) {
          cache.addTo(cacheMarkers);
          cachesToKeep.push(cache);
      } else {
          //console.log("Removing out-of-range cache");
          const tile = B.getCellForPoint(cache.getBounds().getCenter());
          if (tile) tile.isOccupied = false;
      }
  });

  caches = cachesToKeep;
  const originLat = origin.lat;
  const originLng = origin.lng;

  for (let i = -area_size; i <= area_size; i++) {
    for (let j = -area_size; j <= area_size; j++) {
        // Convert grid offsets (i, j) to world coordinates
        const targetLat = originLat + i;
        const targetLng = originLng + j;

        // Check spawnrate and generate cache
        if (luck([targetLat, targetLng].toString()) < spawnrate) {
            generateCache((targetLat-OFFSET1) * B.tileWidth, (targetLng+OFFSET2) * B.tileWidth);
        }
    }
  }
  //console.log(player.getLatLng());
}


//Geolocation stuff

// Start geolocation tracking
function startGeolocation() {
  if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
  }

  console.log('Starting geolocation...');
  watchId = navigator.geolocation.watchPosition(
      (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`User Location: ${latitude}, ${longitude}`);

          // Update player's location on the map
          updatePlayerLocation(latitude, longitude);
          console.log(`New Location: ${latitude}, ${longitude}`);


          //spawn caches based on location
          spawnTheCaches();
      },
      (error) => {
          console.error(`Geolocation error: ${error.message}`);
      },
      {
          enableHighAccuracy: true, // Get accurate location from GPS
          maximumAge: 0,           // Dont use cached positions
      }
  );
}

// Stop geolocation tracking
function stopGeolocation() {
  if (watchId !== null) {
      console.log('Stopping geolocation...');
      navigator.geolocation.clearWatch(watchId); // Stops the watcher
      watchId = null; // Reset watch ID to indicate no active tracking
  }
}

const geoButton = document.getElementById("sensor");
let isGeolocationEnabled = false;




spawnTheCaches();
uiManager.bindGeolocationToggle();

