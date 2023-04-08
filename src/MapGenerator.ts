import {
    Assets,
    Rectangle,
    Texture,
    ParticleContainer,
    Container,
    Sprite,
} from "pixi.js";
import WaveFunctionCollapse, { Tileable } from "./WaveCollapse";

class MazeTile implements Tileable {
    readonly texture: Texture;
    readonly width: number;
    readonly height: number;
    private _topSocket: string;
    private _rightSocket: string;
    private _leftSocket: string;
    private _bottomSocket: string;
    /**
     * creates a new maze tile in pixels
     * @param texture
     * @param topSocket
     * @param rightSocket
     * @param bottomSocket
     * @param leftSocket
     * @param width the width of the tile in pixels
     * @param height the height of the tile in pixels
     */
    constructor(
        texture: Texture,
        topSocket: string,
        rightSocket: string,
        bottomSocket: string,
        leftSocket: string,
        width: number,
        height = width
    ) {
        this._topSocket = topSocket;
        this._rightSocket = rightSocket;
        this._leftSocket = leftSocket;
        this._bottomSocket = bottomSocket;
        this.texture = texture;
        this.width = width;
        this.height = height;
    }
    get topSocket() {
        return this._topSocket;
    }
    get rightSocket() {
        return this._rightSocket;
    }
    get leftSocket() {
        return this._leftSocket;
    }
    get bottomSocket() {
        return this._bottomSocket;
    }
    roateRight(): MazeTile {
        return new MazeTile(
            this.texture,
            this.leftSocket,
            this.topSocket,
            this.rightSocket,
            this.bottomSocket,
            this.width,
            this.height
        );
    }

    /**
     * generates the sprites from each wall, if the sprites have already
     * @returns the conainer containing all the sprites and their walls
     */
    generateSprites(): Container {
        const container = new ParticleContainer();
        const sockets = [
            {
                socket: this.topSocket,
                generator: () => MazeTile.generateTopWall(this.texture),
            },
            {
                socket: this.rightSocket,
                generator: () =>
                    MazeTile.generateRightWall(this.texture, this.width),
            },
            {
                socket: this.bottomSocket,
                generator: () =>
                    MazeTile.generateBottomWall(this.texture, this.height),
            },
            {
                socket: this.leftSocket,
                generator: () => MazeTile.generateLeftWall(this.texture),
            },
        ];
        // creates and adds a sprite for each of the walls, if ther is no wall no sprite will be added
        sockets
            .filter(({ socket }) => {
                return socket === "1";
            })
            .forEach(({ generator }) => {
                container.addChild(generator());
            });

        return container;
    }
    private static generateTopWall(texture: Texture): Sprite {
        const sprite = new Sprite(texture);
        sprite.rotation = -90;
        sprite.y += sprite.width;
        return sprite;
    }
    private static generateRightWall(
        texture: Texture,
        tileWidth: number
    ): Sprite {
        const sprite = new Sprite(texture);
        sprite.x += tileWidth - sprite.width;
        return sprite;
    }
    private static generateBottomWall(
        texture: Texture,
        tileHeight: number
    ): Sprite {
        const sprite = new Sprite(texture);
        sprite.angle = -90;
        sprite.y += tileHeight;
        return sprite;
    }
    private static generateLeftWall(texture: Texture): Sprite {
        const sprite = new Sprite(texture);
        return sprite;
    }
}

/**
 *
 * @param wallTexture the texure of the wall (should be vertical)
 * @returns all the tiles in all possible rotations
 */

function generateTiles(
    wallTexture: Texture,
    width: number,
    height: number
): MazeTile[] {
    let walls: MazeTile[] = [];

    const createRotatedVariations = (tile: MazeTile): MazeTile[] => {
        const tiles: MazeTile[] = [];
        tiles.push(tile);
        Array(3)
            .fill(0)
            .forEach(() => {
                const lastOne = tiles[tiles.length - 1];
                tiles.push(lastOne.roateRight());
            });
        return tiles;
    };
    /**
     * one wall on the left => ║
     */
    walls = walls.concat(
        createRotatedVariations(
            new MazeTile(wallTexture, "0", "0", "0", "1", width, height)
        )
    );

    /**
     * left and right wall => ║ ║
     */
    const oppositeWallTile = new MazeTile(
        wallTexture,
        "0",
        "1",
        "0",
        "1",
        width,
        height
    );
    walls.push(oppositeWallTile, oppositeWallTile.roateRight());

    /**
     * corner walls => ╔
     */
    walls = walls.concat(
        createRotatedVariations(
            new MazeTile(wallTexture, "1", "0", "0", "1", width, height)
        )
    );

    /**
     * three sided walls => ⼕
     */
    walls = walls.concat(
        createRotatedVariations(
            new MazeTile(wallTexture, "1", "0", "1", "1", width, height)
        )
    );
    return walls;
}

const texture = await Assets.load<Texture>("cave_tileset.png");
const torchRectangle = new Rectangle(224, 128, 32, 32);
texture.frame = torchRectangle;

const tiles = generateTiles(texture, 10, 10);
export const algo = new WaveFunctionCollapse(tiles, 2);
