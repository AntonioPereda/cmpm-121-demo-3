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

import { Board } from "./board.ts";

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

//coin info
let pointBank: coinInfo[] = [];

interface coinInfo {
  i: number;
  j: number;
  serial: number;
}


//making the caches
let caches: any[] = [];
let B = new Board(0.75, 6);
function generateCache(i: number, j: number){
      if(luck([origin.lat+i,origin.lng+j].toString()) < spawnrate) {
        let cache = spawnCache(i,j);
        caches.push(cache); 
        B.getCellsNearPoint(leaflet.latLng(origin.lat+i,origin.lng+j), cache);
      }
  return caches
}

//creates cache and details
function spawnCache(i, j){ 
  let coins = Math.floor((luck([i,j].toString()) * 8 + 2));
  let cacheBank: coinInfo[] = [];

  const bounds = leaflet.latLngBounds([
    [NullIsland.lat + origin.lat + i * degrees, NullIsland.lng + origin.lng + j * degrees],
    [NullIsland.lat + origin.lat + (i + 0.75) * degrees, NullIsland.lng +origin.lng + (j + 0.75) * degrees],
  ]);


  
  const rect = leaflet.rectangle(bounds);
  rect.addTo(map);

  let latitude = origin.lat + i;
  let longitude = origin.lng + j;

  let stdLat = Math.floor((latitude * degrees)*15e4);
  let stdLong = Math.floor((longitude * degrees)*15e4);




  //generate coin info
  for (let c = 1; c <= coins; c++){

    cacheBank.push({
      i: stdLat,
      j: stdLong,
      serial: Math.floor( ((stdLat & stdLong) * coins) / c )
    });

  }


  let format = `
  <div>This cache at "${stdLat},${stdLong}" contains <span id = "cacheCoins">${coins} </span> coins.</div>
  <button id="take">Take</button>
  <button id="place">Deposit</button>
  `;
  
  //cache popup
  rect.bindPopup(()=>{
    const popup = document.createElement("div");
    popup.innerHTML = format;


    //TAKE BUTTON
    popup.querySelector<HTMLButtonElement>("#take")!.style.color = "white";
    popup.querySelector<HTMLButtonElement>("#take")!.addEventListener("click", () => {
      if (coins > 0){
        coins--;
        points++;

        let particularCoin = cacheBank.pop();
        pointBank.push(particularCoin);
        //console.log(particularCoin);
        //console.table(cacheBank);

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

        let particularCoin = pointBank.pop();
        cacheBank.push(particularCoin);
        //console.log(particularCoin);
        //console.table(cacheBank);

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
    origin = player.getLatLng();

    if (luck([origin.lat+i, origin.lng+j].toString()) < spawnrate) {
      generateCache(i, j);
    }
  }
}