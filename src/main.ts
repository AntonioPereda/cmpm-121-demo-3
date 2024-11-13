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

const seed_key = 'this is the seed value!';

const random = seedrandom(seed_key);

//make the map
let zoom = 19;
let degrees = 1e-4;
let area_size = 6;
let spawnrate = 0.25;

const NullIsland = leaflet.latLng(0, 0);

const Oakes_Class = leaflet.latLng(36.98949379578401, -122.06277128548504);

//player marker
const player = leaflet.marker(Oakes_Class);
player.bindTooltip("This is you");

//make map
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

//add player top map
player.addTo(map);

//Helper Functions
function coordinateConversion(lat, long) {
  const i = (NullIsland.lat + lat) * 15e+4;
  const j =  (NullIsland.lng + long) * 15e+4;
return  [Math.round(i), Math.round(j)];
}


//point display
let points = 0;
const pointPannel = document.querySelector<HTMLDivElement>("#pointPannel")!;
pointPannel.style.fontSize = "50px";
pointPannel.innerHTML = "0 coins accumulated";


//making the caches
let caches: any[] = [];
function generateCache(i: number, j: number){
      if(luck([i,j].toString()) < spawnrate) {
        let cache = spawnCache(i,j,caches);
        caches.push(cache); 
      }
  console.log(caches);
  return caches
}

//creates cache and details
function spawnCache(i, j, c){
  const origin = NullIsland;

  let coins = Math.floor((luck([i,j].toString()) * 8 + 2));

  const bounds = leaflet.latLngBounds([
    [(origin.lat + i) * degrees, (origin.lng + j) * degrees],
    [(origin.lat + (i + 0.75)) * degrees, (origin.lng + (j + 0.75)) * degrees],
  ]);

  const cacheCoord = coordinateConversion(i, j);
  
  const rect = leaflet.rectangle(bounds);
  rect.addTo(map);

  //cache popup
  let format = `
  <div>This cache at "${cacheCoord[0]}, ${cacheCoord[1]}" contains <span id = "cacheCoins">${coins} </span> coins.</div>
  <button id="take">Take</button>
  <button id="place">Deposit</button>
  `;
  rect.bindPopup(()=>{
    const popup = document.createElement("div");
    popup.innerHTML = format;


    //TAKE BUTTON
    popup.querySelector<HTMLButtonElement>("#take")!.style.color = "white";
    popup.querySelector<HTMLButtonElement>("#take")!.addEventListener("click", () => {
      if (coins > 0){
        coins--;
        points++;
        popup.querySelector<HTMLSpanElement>("#cacheCoins")!.innerHTML =
          coins.toString();
        pointPannel.innerHTML = `${points} coins accumulated`;
        } else {alert("This cache is empty!");}
    });            


    //INSERT BUTTON
    popup.querySelector<HTMLButtonElement>("#place")!.style.color = "white";
    popup.querySelector<HTMLButtonElement>("#place")!.addEventListener("click", () => {
      if (points > 0){
        coins++;
        points--;
        popup.querySelector<HTMLSpanElement>("#cacheCoins")!.innerHTML =
          coins.toString();
        pointPannel.innerHTML = `${points} coins accumulated`;
        } else {alert("You dont have any coins!");}
    });   
    return popup;
  })

  return rect
}

for (let i = -area_size; i < area_size; i++) {
  for (let j = -area_size; j < area_size; j++) {
    // If location i,j is lucky enough, spawn a cache!
    if (luck([i, j].toString()) < spawnrate) {
      let lat = player.getLatLng().lat + i;
      let long = player.getLatLng().lng + j;
      console.log(lat, " ", long, player.getLatLng(), "\n");
      generateCache(lat, long);
    }
  }
}

//Set Center to a "player"
//set origin to "player"

console.log(player.getLatLng());


