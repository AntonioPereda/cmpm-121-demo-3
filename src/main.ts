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
let spawnrate = 0.10;

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

let origin = player.getLatLng();

//point display
let points = 0;
const pointPannel = document.querySelector<HTMLDivElement>("#pointPannel")!;
pointPannel.style.fontSize = "50px";
pointPannel.innerHTML = "0";


//making the caches
let caches: any[] = [];
function generateCache(i: number, j: number){
      if(luck([origin.lat+i,origin.lng+j].toString()) < spawnrate) {
        let cache = spawnCache(i,j);
        caches.push(cache); 
      }
  //console.log(caches);
  return caches
}

//creates cache and details
function spawnCache(i, j){ 
  let coins = Math.floor((luck([i,j].toString()) * 8 + 2));

  const bounds = leaflet.latLngBounds([
    [NullIsland.lat + origin.lat + i * degrees, NullIsland.lng + origin.lng + j * degrees],
    [NullIsland.lat + origin.lat + (i + 0.75) * degrees, NullIsland.lng +origin.lng + (j + 0.75) * degrees],
  ]);


  
  const rect = leaflet.rectangle(bounds);
  rect.addTo(map);

  //cache popup
  let format = `
  <div>This cache at "${i},${j}" contains <span id = "cacheCoins">${coins} </span> coins.</div>
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

  console.log(rect.getBounds());
  return rect
}



for (let i = -area_size; i < area_size; i++) {
  for (let j = -area_size; j < area_size; j++) {
    
    // If location i,j is lucky enough, spawn a cache!
    origin = player.getLatLng();

    if (luck([origin.lat+i, origin.lng+j].toString()) < spawnrate) {
      generateCache(i, j);
    }
  }
}

//Set Center to a "player"
//set origin to "player"