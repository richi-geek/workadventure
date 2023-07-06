type NetworkMode = `none` | `bridge` | `awsvpc` | `host`;

// TODO : associer directement un fichier .json (par son nom ?) a chaque objet container ?
// ex. private containerDefinition: string;

export class Container {
    private name: string;
    private cpu: string;
    private memory: string;
    private networkMode: NetworkMode;

    constructor(name: string, cpu: string, memory: string, networkMode: NetworkMode) {
        this.name = name;
        this.cpu = cpu;
        this.memory = memory;
        this.networkMode = networkMode;
    }

    public getName(): string {
        return this.name;
    }

    public getCpu(): string {
        return this.cpu;
    }

    public getMemory(): string {
        return this.memory;
    }

    public getNetworkMode(): string {
        return this.networkMode;
    }
}