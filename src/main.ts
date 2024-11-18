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


//making the caches
let caches: any[] = [];
let B = new Board(0.75, area_size);
function generateCache(i: number, j: number){

  console.log(caches);
  cacheCopy.eachLayer(function(layer){
    //console.log(checkPlayerDist(player, layer));
  });

      if(luck([origin.lat+i,origin.lng+j].toString()) < spawnrate) {
        let cache = spawnCache(i,j);
        caches.push(cache); 
        
      }
  return caches;

      //NEW METHOD
      /* 

      For each layer, if new player location is within distance, push it to cacheMarkers

      Only push to caches if it doesnt already exist

      For each layer, check nearby. If it already exists and within range, push to cacheMarkers
      
      */


}

//Checks if A is within area_size of B
function checkDist(markerA: leaflet.Rectangle, markerB:leaflet.Rectangle){



}
function checkPlayerDist(player: leaflet.marker, markerB:leaflet.Rectangle){

  let playerLat = player.getLatLng().lat;
  let playerLng = player.getLatLng().lng;

  let bLat = markerB.getBounds()._northEast.lat;
  let bLng = markerB.getBounds()._northEast.lng;

  console.log(Math.abs(playerLat-bLat));

  if (Math.abs(playerLat-bLat) <= area_size) {

    if(Math.abs(playerLng - bLng) <= area_size){return true;}

  }

  return false;

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
  rect.addTo(cacheMarkers);

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

        popup.querySelector<HTMLSpanElement>("#cacheCoins")!.innerHTML =
          coins.toString();
        pointPannel.innerHTML = `${points} coins accumulated`;
        } else {alert("You dont have any coins!");}
    });   
    return popup;
  })

  return rect
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




//Spawn new caches
let cacheCopy;
function spawnTheCaches(){
  cacheCopy = cacheMarkers;

  cacheMarkers.clearLayers();
  for (let i = -area_size; i < area_size; i++) {
    for (let j = -area_size; j < area_size; j++) {
      
      // If location i,j is lucky enough, spawn a cache!
      origin = player.getLatLng();
  
      if (luck([origin.lat+i, origin.lng+j].toString()) < spawnrate) {
        generateCache(i, j);
      }
    }
  }
};

spawnTheCaches();
console.log(caches);
