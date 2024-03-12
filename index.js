// Game settings
const config = {
  TILE_SIZE: 30,
  MAP_MARGIN: 3,
};

// Utilities
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Map
class Tile {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }
  generate() {
    const tileElement = document.createElement("div");
    tileElement.classList.add("tile");

    this.type === "W" && tileElement.classList.add("tileW");

    tileElement.style.top = `${this.y * config.TILE_SIZE}px`;
    tileElement.style.left = `${this.x * config.TILE_SIZE}px`;
    return tileElement;
  }
}
class Room {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  generate(map) {
    const startX = Math.max(this.x, 1);
    const startY = Math.max(this.y, 1);

    const endX = Math.min(this.x + this.width, map.cols - 1);
    const endY = Math.min(this.y + this.height, map.rows - 1);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        map.tiles[y][x] = new Tile(x, y, " ");
      }
    }
  }
}
class Corridor {
  constructor(startX, startY, endX, endY) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }
  generate(map) {
    if (this.startY === this.endY) {
      const startX = Math.min(this.startX, this.endX);
      const endX = Math.max(this.startX, this.endX);

      for (let x = startX; x <= endX; x++) {
        map.tiles[this.startY][x] = new Tile(x, this.startY, " ");
      }
    } else if (this.startX === this.endX) {
      const startY = Math.min(this.startY, this.endY);
      const endY = Math.max(this.startY, this.endY);

      for (let y = startY; y <= endY; y++) {
        map.tiles[y][this.startX] = new Tile(this.startX, y, " ");
      }
    }
  }
}
class Map {
  constructor(cols, rows, field) {
    this.cols = cols;
    this.rows = rows;
    this.field = field;
    this.tiles = [];
    this.init();
  }

  init() {
    for (let y = 0; y < this.rows; y++) {
      this.tiles[y] = new Array(this.cols);
      for (let x = 0; x < this.cols; x++) {
        this.tiles[y][x] = new Tile(x, y, "W");
      }
    }

    this.createRooms();
    this.createCorridors();
    this.generate();
  }
  createRooms() {
    const roomCount = getRandom(5, 10);

    function getPosition(dimension, roomSize, margin = config.MAP_MARGIN) {
      const position = Math.random() * (dimension - roomSize - 2 * margin);
      return margin + Math.floor(position);
    }

    for (let i = 0; i < roomCount; i++) {
      const width = getRandom(3, 8);
      const height = getRandom(3, 8);

      const x = getPosition(this.cols, width);
      const y = getPosition(this.rows, height);

      const room = new Room(x, y, width, height);
      room.generate(this);
    }
  }
  createCorridors() {
    const corridorXCount = getRandom(3, 5);
    const corridorYCount = getRandom(3, 5);

    function getSpacing(dimension, count) {
      return Math.floor(dimension / (count + 1));
    }

    const spaceY = getSpacing(this.rows, corridorXCount);
    const spaceX = getSpacing(this.cols, corridorYCount);

    for (let i = 1; i <= corridorXCount; i++) {
      const y = i * spaceY;
      const corridor = new Corridor(0, y, this.cols - 1, y);
      corridor.generate(this);
    }
    for (let i = 1; i <= corridorYCount; i++) {
      const x = i * spaceX;
      const corridor = new Corridor(x, 0, x, this.rows - 1);
      corridor.generate(this);
    }
  }
  generate() {
    this.field.innerHTML = "";

    for (let row of this.tiles) {
      for (let tile of row) {
        const element = tile.generate();
        this.field.appendChild(element);
      }
    }
  }
}

// Game
class Game {
  constructor(field) {
    this.map = new Map(40, 24, field);
  }

  init() {
    this.map.generate();
  }
}

// Start
document.addEventListener("DOMContentLoaded", () => {
  const field = document.getElementById("field");

  if (field) {
    const game = new Game(field);
    game.init();
  }
});
