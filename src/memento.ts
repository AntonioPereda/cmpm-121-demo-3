export class Memento {
    private state: CacheState[];

    constructor(state: CacheState[]) {
        this.state = JSON.parse(JSON.stringify(state)); // Ensure deep copy
    }

    getState(): CacheState[] {
        return JSON.parse(JSON.stringify(this.state)); // Return a copy to preserve immutability
    }
}

interface CacheState {
    id: number;
    val: number;
    lat: number;
    lng: number;
}

export class CacheOriginator {
    private caches: CacheState[] = []; // Holds the current state.

    constructor(){
        this.caches = [];
    }

    // Set the current state
    setState(state: CacheState[]): void {
        this.caches = state;
    }

    // Save the current state to a Memento object
    saveStateToMemento(): Memento {
        return new Memento(this.caches);
    }

    // Restore the state from a Memento object
    getStateFromMemento(memento: Memento): void {
        this.caches = memento.getState();
    }

    // Add this method to retrieve the current state
    getState(): CacheState[] {
        return this.caches;
    }
}

export class Caretaker {
    private mementoList: Memento[] = [];

    add(memento: Memento): void {
        this.mementoList.push(memento);
    }

    get(index: number): Memento {
        return this.mementoList[index];
    }
}