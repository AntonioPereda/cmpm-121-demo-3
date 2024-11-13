import leaflet from "leaflet";
import luck from "./luck.ts";

interface Cell {
    readonly i: number;
    readonly j: number;
    value: number;
    ID: number;
    //cache *id;
}

export class Board {

    readonly tileWidth: number;
    readonly tileVisibilityRadius: number;

    private readonly knownCells: Map<string, Cell>;

    constructor(tileWidth: number, tileVisibilityRadius: number) {
        // ...
        this.tileWidth = tileWidth;
        this.tileVisibilityRadius = tileVisibilityRadius;
        this.knownCells = new Map();

    }

    private getCanonicalCell(cell: Cell): Cell {
        const { i, j } = cell;
        const key = [i, j].toString();
        // GET SINGLE CELL
        
        return this.knownCells.get(key)!;
    }



    /*
    i,j = [36.98949379578401, -122.06277128548504]
    
    */
    getCellForPoint(point: leaflet.LatLng): Cell {
        return this.getCanonicalCell({ //feed ij + other cell stuff
            
        });
    }
// NULL ISLAND AS WELL
            

    getCellBounds(cell: Cell): leaflet.LatLngBounds {
    	// RETURN BOUNDS FOR CELL
        /*
        const bounds = leaflet.latLngBounds([
        [origin.lat + i * degrees, origin.lng + j * degrees],
        [origin.lat + (i + 0.75) * degrees, origin.lng + (j + 0.75) * degrees],
        ]);*/
    }

    getCellsNearPoint(point: leaflet.LatLng): Cell[] {
        const resultCells: Cell[] = [];
        const originCell = this.getCellForPoint(point);
        // NEIGHBORS
        return resultCells;
    }
}
