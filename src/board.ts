import leaflet from "leaflet";
import luck from "./luck.ts";

interface Cell {
    readonly i: number;
    readonly j: number;
    cache: leaflet.Rectangle; // "pointer" to the cache object
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
        if (!(key in this.knownCells)){
            this.knownCells[key] = cell;
        }
        
        return this.knownCells.get(key)!;
    }



    /*
    point = [36.98949379578401, -122.06277128548504]
    
    */
    getCellForPoint(point: leaflet.LatLng, cacheRect: leaflet.Rectangle): Cell {
        return this.getCanonicalCell({
            i: point.lat,
            j: point.lng,
            cache: cacheRect
        });
    }

            

    getCellBounds(cell: Cell): leaflet.LatLngBounds {
    	// RETURN BOUNDS FOR CELL
        return cell.cache.getBounds();
    }

    getCellsNearPoint(point: leaflet.LatLng, cacheRect: leaflet.Rectangle): Cell[] {
        const resultCells: Cell[] = [];
        const originCell = this.getCellForPoint(point, cacheRect);
        // NEIGHBORS
        
        // List of neighbor offsets
        const neighborOffsets = [
            { i: -1, j: -1 }, { i: -1, j: 0 }, { i: -1, j: 1 },
            { i: 0, j: -1 },                { i: 0, j: 1 },
            { i: 1, j: -1 }, { i: 1, j: 0 }, { i: 1, j: 1 }
        ];

        for (const offset of neighborOffsets) {

            if (originCell != undefined){

                const neighborRow = originCell.i + offset.i;
                const neighborColumn = originCell.j + offset.j;

                // Check if the neighboring cell is within bounds
                if (neighborRow >= 0 && neighborColumn >= 0) {

                    let bounds = leaflet.latLng(neighborRow, neighborColumn);
                    
                    const neighborCell: Cell = this.getCellForPoint(bounds, cacheRect);
                    resultCells.push(neighborCell);
                }
            }
        }

        return resultCells;
    }
}
