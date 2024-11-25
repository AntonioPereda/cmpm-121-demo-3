import leaflet from "leaflet";
import luck from "./luck.ts";

interface Tile {
    readonly i: number;
    readonly j: number;
    isOccupied: boolean;
}

export class Board {

    readonly tileWidth: number;
    readonly tileVisibilityRadius: number;

    private readonly knownTiles: Map<string, Tile>;

    constructor(tileWidth: number, tileVisibilityRadius: number) {
        // ...
        this.tileWidth = tileWidth;
        this.tileVisibilityRadius = tileVisibilityRadius;
        this.knownTiles = new Map();

    }

    private getCanonicalCell(tile: Tile): Tile {
        const { i, j } = tile;
        const key = [i, j].toString();
        // GET SINGLE CELL
        if (!this.knownTiles.has(key)) {
            this.knownTiles.set(key, tile);
        }   
        //console.log(this.knownTiles[key]);
        return this.knownTiles[key]!;
    }



    /*
    point = [36.98949379578401, -122.06277128548504]
    
    */
    getCellForPoint(point: leaflet.LatLng): Tile {
        
        const retCell = this.getCanonicalCell({
            i: point.lat,
            j: point.lng,
            isOccupied: false
        });

        //console.log(retCell);

        return retCell;
    }

            

    getCellBounds(cell: Tile): leaflet.LatLngBounds {
        // Use the cell's `i, j` coordinates and tile width to compute bounds
        const bounds = leaflet.latLngBounds([
            [cell.i * this.tileWidth, cell.j * this.tileWidth],                       // Bottom-left corner
            [(cell.i + 1) * this.tileWidth, (cell.j + 1) * this.tileWidth]            // Top-right corner
        ]);
        
        return bounds;
    }

    
    getCellsNearPoint(point: leaflet.LatLng): Tile[] {
        const resultTiles: Tile[] = [];
        const originTile = this.getCellForPoint(point);
    
        for (let iOffset = -this.tileVisibilityRadius; iOffset <= this.tileVisibilityRadius; iOffset++) {
            for (let jOffset = -this.tileVisibilityRadius; jOffset <= this.tileVisibilityRadius; jOffset++) {
                const neighborRow = originTile.i + iOffset;
                const neighborColumn = originTile.j + jOffset;
    
                if (neighborRow >= 0 && neighborColumn >= 0) {
                    const neighborTile = this.getTileAt(neighborRow, neighborColumn);
    
                    // Optionally skip occupied tiles
                    if (neighborTile && !neighborTile.isOccupied) {
                        resultTiles.push(neighborTile);
                    }
                }
            }
        }
    
        return resultTiles;
    }

    private isTileWithinBounds(row: number, column: number): boolean {
        const maxRow = 5;
        const maxColumn = 5;
        return row >= 0 && row < maxRow && column >= 0 && column < maxColumn;
    }

    getTileAt(row: number, column: number): Tile {
        const key = `${row},${column}`;
        if (!this.knownTiles.has(key)) {
            // Create the tile lazily if it doesn't exist
            this.knownTiles.set(key, { i: row, j: column, isOccupied: false });
        }
        return this.knownTiles.get(key)!;
    }

    private getTileForPoint(point: leaflet.LatLng): Tile {
        const row = Math.floor(point.lat / this.tileWidth);
        const column = Math.floor(point.lng / this.tileWidth);
        return this.getTileAt(row, column);
    }
     
}



export class CacheManager {
    private caches: leaflet.Rectangle[] = []; // Track cache objects

    constructor(){
        this.caches = [];
    }

    // Add a cache and return its reference
    addCache(bounds: leaflet.LatLngBounds): leaflet.Rectangle {
        const cache = leaflet.rectangle(bounds);
        this.caches.push(cache);
        return cache;
    }

    // Check for nearby caches
    getNearbyCaches(center: leaflet.LatLng, radius: number): leaflet.Rectangle[] {
        return this.caches.filter(cache => {
            const distance = cache.getBounds().contains(center);
            return distance <= radius;
        });
    }

    // Save cache state to integrate with Memento
    saveState(): CacheState[] {
        return this.caches.map(cache => ({
            id: cache._leaflet_id,
            val: 1, // Update with real logic
            lat: cache.getBounds().getNorthEast().lat,
            lng: cache.getBounds().getNorthEast().lng,
        }));
    }
}