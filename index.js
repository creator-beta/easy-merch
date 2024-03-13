// Main entities
class Map {
  constructor(cols, rows, field) {
    this.cols = cols;
    this.rows = rows;
    this.field = field;
    this._map = this.generateMap();
  }
  get map() {
    return this._map;
  }
  generateMap() {
    const map = new Array(this.rows);
    for (let y = 0; y < this.rows; y++) {
      map[y] = new Array(this.cols);
      for (let x = 0; x < this.cols; x++) {
        const gameObject = new GameObject(x, y, "wall");
        gameObject.generateObj();
        map[y][x] = gameObject;
        this.field.appendChild(gameObject.element);
      }
    }
    return map;
  }
  updateMap(x, y, type, element = null) {
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      const gameObject = this._map[y][x];
      gameObject.updateObj({ x, y, type });

      if (element) {
        if (gameObject.element.parentNode) {
          gameObject.element.parentNode.replaceChild(
            element,
            gameObject.element
          );
        }
        gameObject.element = element;
      }
    }
  }
}
class Game {
  constructor(field) {
    this.map = new Map(40, 24, field);
    this.mapGenerator = new MapGenerator(this.map);
    this.objGenerator = new ObjectGenerator(this.map);
  }
  init() {
    console.log("🗺️ Initial map generation");
    this.mapGenerator.generateRooms();
    console.log("🏠 Rooms have been generated");
    this.mapGenerator.generatePaths();
    console.log("🛣️ Paths have been generated");
    this.objGenerator.generateObjects();
    console.log("⚔️ Perks have been spawned");
    this.objGenerator.generateCharacters();
    console.log("🦸🏻 Characters have been added");
  }
}
class GameObject {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.element = null;
  }
  generateObj() {
    const element = document.createElement("div");
    element.classList.add("tile", this.type);
    element.style.top = `${this.y * 30}px`;
    element.style.left = `${this.x * 30}px`;
    this.element = element;
    return element;
  }
  updateObj({ x, y, type }) {
    if (x !== undefined) {
      this.x = x;
      this.element.style.left = `${x * 30}px`;
    }
    if (y !== undefined) {
      this.y = y;
      this.element.style.top = `${y * 30}px`;
    }
    if (type !== undefined && this.type !== type) {
      this.element.classList.remove(this.type);
      this.type = type;
      this.element.classList.add(type);
    }
  }
}

// Map entities
class Room {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = Math.floor(Math.random() * (8 - 3 + 1)) + 3;
    this.height = Math.floor(Math.random() * (8 - 3 + 1)) + 3;
  }
  generateRoom() {
    let roomStructure = [];
    for (let i = 0; i < this.height; i++) {
      roomStructure[i] = [];
      for (let j = 0; j < this.width; j++) {
        roomStructure[i][j] = new GameObject(j + this.x, i + this.y, "empty");
      }
    }
    return roomStructure;
  }
}
class Path {
  constructor(map, axis, position) {
    this.map = map;
    this.axis = axis;
    this.position = position;
  }
  generatePath() {
    const path = [];
    const length = this.axis === "x" ? this.map.cols : this.map.rows;

    for (let i = 0; i < length; i++) {
      const x = this.axis === "x" ? i : this.position;
      const y = this.axis === "y" ? i : this.position;
      path.push(new GameObject(x, y, "empty"));
    }

    return path;
  }
}

// Generators
class MapGenerator {
  constructor(map) {
    this.map = map;
  }
  generateRooms() {
    const roomsCount = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
    for (let i = 0; i < roomsCount; i++) {
      let isGenerated = false;

      while (!isGenerated) {
        const x = Math.floor(Math.random() * (this.map.cols - 3 * 2 - 8)) + 3;
        const y = Math.floor(Math.random() * (this.map.rows - 3 * 2 - 8)) + 3;
        const room = new Room(x, y);

        if (
          x + room.width <= this.map.cols - 3 &&
          y + room.height <= this.map.rows - 3
        ) {
          const sample = room.generateRoom();

          for (let row = 0; row < sample.length; row++) {
            for (let col = 0; col < sample[row].length; col++) {
              this.map.updateMap(x + col, y + row, sample[row][col].type);
            }
          }
          isGenerated = true;
        }
      }
    }
  }
  generatePaths() {
    this.generatePathByAxis("x", Math.floor(Math.random() * (5 - 3 + 1)) + 3);
    this.generatePathByAxis("y", Math.floor(Math.random() * (5 - 3 + 1)) + 3);
  }
  generatePathByAxis(axis, pathsCount) {
    let interval;
    if (axis === "x") {
      interval = Math.floor(this.map.rows / (pathsCount + 1));
    } else {
      interval = Math.floor(this.map.cols / (pathsCount + 1));
    }

    for (let i = 1; i <= pathsCount; i++) {
      const position = interval * i;
      const path = new Path(this.map, axis, position).generatePath();
      path.forEach((gameObj) => {
        this.map.updateMap(gameObj.x, gameObj.y, gameObj.type);
      });
    }
  }
}
class ObjectGenerator {
  constructor(map) {
    this.map = map;
  }
  generateObjects() {
    this.placeEntities("hp", 10);
    this.placeEntities("sword", 2);
  }
  generateCharacters() {
    this.placeEntities("player", 1, (x, y) => new Player(x, y).generateObj());
    this.placeEntities("enemy", 10, (x, y) => new Enemy(x, y).generateObj());
  }
  placeEntities(type, count, createEntity = null) {
    let placed = 0;
    while (placed < count) {
      const x = Math.floor(Math.random() * this.map.cols);
      const y = Math.floor(Math.random() * this.map.rows);

      if (this.map.map[y][x].type === "empty") {
        if (createEntity) {
          const entityElement = createEntity(x, y);
          this.map.updateMap(x, y, type, entityElement);
        } else {
          this.map.updateMap(x, y, type);
        }
        placed++;
      }
    }
  }
}

// Game entities
class Character extends GameObject {
  constructor(x, y, type, health = 100, power = 33.3) {
    super(x, y, type);
    this._health = health;
    this.power = power;
    this.element = this.generateObj();
  }
  get health() {
    return this._health;
  }
  set health(newHealth) {
    this._health = newHealth;
    this.healthBar.style.width = `${this._health}%`;
  }
  generateObj() {
    const obj = super.generateObj();
    this.healthBar = document.createElement("div");
    this.healthBar.className = "health";
    this.healthBar.style.width = `${this._health}%`;
    obj.appendChild(this.healthBar);
    return obj;
  }
  addFeature(amount, feature) {
    if (feature === "health") {
      this.health = Math.min(this.health + amount, 100);
    } else if (this[feature] !== undefined) {
      this[feature] += amount;
    }
  }
  reduceFeature(amount, feature) {
    if (feature === "health") {
      this.health = Math.max(this.health - amount, 0);
    } else if (this[feature] !== undefined) {
      this[feature] = Math.max(this[feature] - amount, 0);
    }
  }
}
class Player extends Character {
  constructor(x, y, health, power) {
    super(x, y, "player", health, power); // Сорян, захардкодил :)
  }
}
class Enemy extends Character {
  constructor(x, y, health, power) {
    super(x, y, "enemy", health, power); // Сорян, захардкодил :)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const field = document.getElementById("field");
  const game = new Game(field);
  game.init();
});
