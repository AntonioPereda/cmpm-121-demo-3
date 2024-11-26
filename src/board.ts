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
        //console.log(this.knownCells[key]);
        return this.knownCells[key]!;
    }



    /*
    point = [36.98949379578401, -122.06277128548504]
    
    */
    getCellForPoint(point: leaflet.LatLng, cacheRect: leaflet.Rectangle): Cell {
        
        const retCell = this.getCanonicalCell({
            i: point.lat,
            j: point.lng,
            cache: cacheRect
        });

        //console.log(retCell);

        return retCell;
    }

            

    getCellBounds(cell: Cell): leaflet.LatLngBounds {
    	// RETURN BOUNDS FOR CELL
        return cell.cache.getBounds();
    }

    getCellsNearPoint(point: leaflet.LatLng, cacheRect: leaflet.Rectangle): Cell[] {
        const resultCells: Cell[] = [];
        const originCell = this.getCellForPoint(point, cacheRect);

        //console.log(originCell);
    
        // Iterate over a square area defined by the tileVisibilityRadius
        for (let iOffset = -this.tileVisibilityRadius; iOffset <= this.tileVisibilityRadius; iOffset++) {
            for (let jOffset = -this.tileVisibilityRadius; jOffset <= this.tileVisibilityRadius; jOffset++) {
                const neighborRow = originCell.i + iOffset;
                const neighborColumn = originCell.j + jOffset;
                
                // Check if the neighboring cell is within bounds
                if (neighborRow >= 0 && neighborColumn >= 0) {
                    const neighborLatLng = leaflet.latLng(neighborRow, neighborColumn);
                    const neighborCell = this.getCellForPoint(neighborLatLng, cacheRect);
    
                    if (neighborCell) {
                        resultCells.push(neighborCell);
                        
                    }
                    console.log(neighborCell);
                }
            }
        }
    
        return resultCells;
    }
}