import leaflet from "leaflet";
import luck from "./luck.ts";

interface Cell {
    readonly i: number;
    readonly j: number;
    value: number;
    ID: number;
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
        // ... 
        
        return this.knownCells.get(key)!;
    }

    getCellForPoint(point: leaflet.LatLng): Cell {
        return this.getCanonicalCell({
            // ...
        });
    }


    getCellBounds(cell: Cell): leaflet.LatLngBounds {
    	// ...
    }

    getCellsNearPoint(point: leaflet.LatLng): Cell[] {
        const resultCells: Cell[] = [];
        const originCell = this.getCellForPoint(point);
        // ...
        return resultCells;
    }
}
