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



const seed_key = 'this is the seed value!';

const random = seedrandom(seed_key);

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
let spawnrate = 0.10;

//making the caches
let caches: leaflet.Rectangle[] = [];
let B = new Board(0.75, area_size);
let cacheManager = new CacheManager();

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
  minZoom: zoom,
  maxZoom: zoom,
  zoomControl: false,
  scrollWheelZoom: false,
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


function generateCache(i: number, j: number) {
  // Iterate over existing caches to find nearby and persist valid ones
  console.log("generateCache is called");
  caches.forEach((cache) => {
    let nearby = findNearby(cache);

    for (let item of nearby) {
      if (item != undefined && checkPlayerDist(player, item)) {
        item.addTo(cacheMarkers); // Keep existing caches within player's range
      }
    }
  });

      let newCache = spawnCache(i, j);
      attachPopup(newCache.rect, newCache.data);
      caches.push(newCache.rect); 


  return caches;
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





//Movement

let movementScale = 0.00005;
//let movementScale = 0.001;


const moveUp = document.getElementById("up");
const moveDown = document.getElementById("down");
const moveLeft = document.getElementById("left");
const moveRight = document.getElementById("right");

moveUp.onclick = () =>{
  let i = player.getLatLng().lat;
  let j = player.getLatLng().lng;
  player.setLatLng(leaflet.latLng(i+movementScale, j));
  map.setView(player.getLatLng());
  spawnTheCaches();
}

moveDown.onclick = () =>{
  let i = player.getLatLng().lat;
  let j = player.getLatLng().lng;
  player.setLatLng(leaflet.latLng(i-movementScale, j));
  map.setView(player.getLatLng());
  spawnTheCaches();
}

moveLeft.onclick = () =>{
  let i = player.getLatLng().lat;
  let j = player.getLatLng().lng;
  player.setLatLng(leaflet.latLng(i, j-movementScale));
  map.setView(player.getLatLng());
  spawnTheCaches();
}

moveRight.onclick = () =>{
  let i = player.getLatLng().lat;
  let j = player.getLatLng().lng;
  player.setLatLng(leaflet.latLng(i, j+movementScale));
  map.setView(player.getLatLng());
  spawnTheCaches();
}




// Function to clone a LayerGroup
function cloneLayerGroup(layerGroup) {
  const newLayerGroup = leaflet.layerGroup();
  layerGroup.eachLayer(function(layer){layer.addTo(newLayerGroup)});

  return newLayerGroup;
}

//Spawn new caches
function spawnTheCaches() {
  const newOrigin = player.getLatLng();
  let cachesToKeep: leaflet.Rectangle[] = []; // Track which caches stay in the range
  //console.log("Initial cachesToKeep:", cachesToKeep);

  // Loop over existing caches and determine if they should stay in range
  caches.forEach((cache) => {
    //console.log("Processing cache:", cache);

    // Keep only valid rectangles that are still in range
    if (checkPlayerDist(player, cache) && cache instanceof leaflet.Rectangle) {
      cache.addTo(cacheMarkers); // Add valid cache back to the visible layer group
      cachesToKeep.push(cache); // Add it to the list of caches to preserve
    } else {
      //console.warn("Unexpected or invalid cache detected:", cache);
    }
  });
  //console.log("CachesToKeep after filtering:", cachesToKeep);

  // Ensure only flat and valid rectangles are reassigned to caches
  caches = cachesToKeep.flat().filter((item) => item instanceof leaflet.Rectangle);
  //console.log("Caches after sanitizing:", caches);

  // Update the player's location
  origin = newOrigin;

  // Spawn new caches in the vicinity using `generateCache`
  for (let i = -area_size; i < area_size; i++) {
    for (let j = -area_size; j < area_size; j++) {
      const pos = [origin.lat + i * degrees, origin.lng + j * degrees];
      //console.log("Calculating spawn for pos:", pos);

      // Use `luck` to determine if a new cache should spawn
      if (luck(pos.toString()) < spawnrate) {
        //console.log("Spawning cache at:", i, j);
        const generatedCaches = generateCache(i, j);
        //console.log("Generated caches at (i, j):", i, j, " -> ", generatedCaches);

        if (generatedCaches && Array.isArray(generatedCaches)) {
          generatedCaches.forEach((cache) => {
            if (cache instanceof leaflet.Rectangle) {
              caches.push(cache); // Add only valid rectangles to the master list
              //console.log("Cache added:", cache);
            } else {
              //console.error("Invalid cache structure from generateCache:", cache);
            }
          });
        } else {
          //console.warn("generateCache returned invalid or empty data:", generatedCaches);
        }
      }
    }
  }

  //console.log("Final state of caches after spawning new ones:", caches);
}

spawnTheCaches();


const originator = new CacheOriginator();
const caretaker = new Caretaker();

