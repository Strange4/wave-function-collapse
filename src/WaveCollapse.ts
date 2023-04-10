/**
 * Terminology
 *  - module: a single type of value
 *  - box: an array containing all the possible modules x and y axis on the gridd
 *  - collapsed box: when the box contains only one type of value
 */
export default class WaveFunctionCollapse<T extends Tileable> {
    grid: Slot<T>[];
    gridWidth: number;
    gridHeight: number;
    constructor(possibleValues: T[], width: number, height: number = width) {
        // go through all the possible values and setup their neighboors depending on their sockets
        const possibleModules = possibleValues.map((value) => {
            const topNeighboors = possibleValues.filter((possibleValue) => {
                return possibleValue.bottomSocket === value.topSocket;
            });
            const leftNeighboors = possibleValues.filter((possibleValue) => {
                return possibleValue.rightSocket === value.leftSocket;
            });
            const rightNeighboors = possibleValues.filter((possibleValue) => {
                return possibleValue.leftSocket === value.rightSocket;
            });
            const bottomNeighboors = possibleValues.filter((possibleValue) => {
                return possibleValue.topSocket === value.bottomSocket;
            });
            return Module.builder(value)
                .setTopNeighboors(topNeighboors)
                .setLeftNeighboors(leftNeighboors)
                .setRightNeighboors(rightNeighboors)
                .setBottomNeighboors(bottomNeighboors)
                .build();
        });
        this.grid = [];
        Array(width * height)
            .fill(0)
            .forEach((_, i) => {
                // create a new copy of all the modules for each entry of the grid
                const options = possibleModules.map((module) => {
                    return Module.from(module);
                });
                this.grid[i] = new Slot(
                    i % width,
                    Math.floor(i / width),
                    options
                );
            });
        this.gridWidth = width;
        this.gridHeight = height;
    }

    // steps through the algorithm and returns true of false if all the slots have collapsed
    stepThrough(): boolean {
        const leastEntropyBoxes = this.grid
            .sort((a, b) => {
                return a.options.length - b.options.length;
            })
            .filter((box) => {
                // removing the boxes that have been collapsed
                return box.options.length > 1;
            })
            .filter((box, _, leastEntropyBoxes) => {
                // removing all the boxes that don't have the least entropy
                return (
                    box.options.length === leastEntropyBoxes[0].options.length
                );
            });
        // no more modules to collapse
        if (leastEntropyBoxes.length === 0) {
            return true;
        }
        // choosing a random module to collapse
        const toCollapseBox =
            leastEntropyBoxes[getRandomInt(0, leastEntropyBoxes.length)];
        const collapsedModule =
            toCollapseBox.options[
                getRandomInt(0, toCollapseBox.options.length)
            ];
        // removing all those other modules
        toCollapseBox.options = [collapsedModule];
        this.propagateCollapse(toCollapseBox);
        return false;
    }

    private propagateCollapse(box: Slot<T>) {
        const moduleIndex = box.x + box.y * this.gridWidth;
        const topNeighboor =
            box.y === 0 ? undefined : this.grid[moduleIndex - this.gridWidth];
        const leftNeighboor =
            box.x === 0 ? undefined : this.grid[moduleIndex - 1];
        const rightNeighboor =
            box.x + 1 === this.gridWidth
                ? undefined
                : this.grid[moduleIndex + 1];
        const bottomNeighboor =
            box.y + 1 === this.gridHeight
                ? undefined
                : this.grid[moduleIndex + this.gridWidth];
        const module = box.options[0];
        const possibleNeighboors = [
            module.topNeighboors,
            module.leftNeighboors,
            module.rightNeighboors,
            module.bottomNeighboors,
        ];
        [topNeighboor, leftNeighboor, rightNeighboor, bottomNeighboor]
            .filter((neighboor) => neighboor !== undefined)
            .map((neighboor, index) => {
                return {
                    neighboor: neighboor!,
                    possibleNeighboors: possibleNeighboors[index],
                };
            })
            .forEach(({ neighboor, possibleNeighboors }) => {
                const originalOptions = neighboor.options.length;
                neighboor.options.filter((someOption) => {
                    // if any of the possible neighboors have this module then keep it
                    return possibleNeighboors.some((possibleOption) => {
                        return WaveFunctionCollapse.TileableAreEqual(
                            possibleOption,
                            someOption.value
                        );
                    });
                });
                // only propagate again if the top neighboor changes
                if (originalOptions !== neighboor.options.length) {
                    this.propagateCollapse(neighboor);
                }
            });
    }

    private static TileableAreEqual<T extends Tileable>(a: T, b: T) {
        return (
            a.topSocket === b.topSocket &&
            a.leftSocket === b.leftSocket &&
            a.rightSocket === b.rightSocket &&
            a.bottomSocket === b.bottomSocket
        );
    }
}

class Slot<T extends Tileable> {
    x: number;
    y: number;
    options: Module<T>[];
    constructor(x: number, y: number, options: Module<T>[]) {
        this.x = x;
        this.y = y;
        this.options = options;
    }
}

export class Module<T extends Tileable> {
    value: T;
    topNeighboors: T[];
    rightNeighboors: T[];
    leftNeighboors: T[];
    bottomNeighboors: T[];
    constructor(
        value: T,
        topNeighboors: T[],
        rightNeighboors: T[],
        leftNeighboors: T[],
        bottomNeighboors: T[]
    ) {
        this.topNeighboors = topNeighboors;
        this.rightNeighboors = rightNeighboors;
        this.leftNeighboors = leftNeighboors;
        this.bottomNeighboors = bottomNeighboors;
        this.value = value;
    }

    static from<T extends Tileable>(module: Module<T>): Module<T> {
        const {
            value,
            topNeighboors,
            rightNeighboors,
            leftNeighboors,
            bottomNeighboors,
        } = module;
        return new Module(
            value,
            topNeighboors,
            rightNeighboors,
            leftNeighboors,
            bottomNeighboors
        );
    }

    static builder<T extends Tileable>(value: T): ModuleBuilder<T> {
        return new ModuleBuilder(value);
    }
}

class ModuleBuilder<T extends Tileable> {
    module: Module<T>;
    constructor(value: T) {
        this.module = new Module(value, [], [], [], []);
    }
    setTopNeighboors(topNeighboors: T[]) {
        this.module.topNeighboors = topNeighboors;
        return this;
    }

    setRightNeighboors(rightNeighboors: T[]) {
        this.module.rightNeighboors = rightNeighboors;
        return this;
    }

    setBottomNeighboors(bottomNeighboors: T[]) {
        this.module.bottomNeighboors = bottomNeighboors;
        return this;
    }

    setLeftNeighboors(leftNeighboors: T[]) {
        this.module.leftNeighboors = leftNeighboors;
        return this;
    }

    build(): Module<T> {
        return this.module;
    }
}

export interface Tileable {
    get topSocket(): string;
    get rightSocket(): string;
    get bottomSocket(): string;
    get leftSocket(): string;
}

export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 *
 */
