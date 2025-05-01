// Import prompt-sync for user input
import promptSync from "prompt-sync";
const prompt = promptSync({ sigint: true });
// Import chalk for colored output
import chalk from "chalk";

// Define game characters
const hat = "^";
const hole = "O";
const fieldCharacter = "░";
const pathCharacter = "*";

class Field {
  constructor(fieldArray) {
    this.field = fieldArray;
    this.gameOver = false;
    this.turns = 0;

    // Random starting location that is not a hole or hat
    let x, y;
    do {
      x = Math.floor(Math.random() * this.field[0].length);
      y = Math.floor(Math.random() * this.field.length);
    } while (this.field[y][x] === hole || this.field[y][x] === hat);

    this.playerX = x;
    this.playerY = y;
    this.field[y][x] = pathCharacter;
  }

  // Print the current field with color coding for readability
  print() {
    const fieldString = this.field
      .map((row, rowIndex) =>
        row
          .map((cell, colIndex) => {
            if (rowIndex === this.playerY && colIndex === this.playerX) {
              // Make the current position stand out (e.g., blue)
              return chalk.cyan(pathCharacter);
            }
            if (cell === pathCharacter) {
              // Change path color based on turn count
              const color = this.turns % 2 === 0 ? chalk.green : chalk.magenta;
              return color(cell);
            }
            if (cell === hole) return chalk.red(cell);
            if (cell === hat) return chalk.yellow(cell);
            return cell;
          })
          .join("")
      )
      .join("\n");
    console.log(fieldString);
  }

  // Handle movement and game logic
  move(direction) {
    direction = direction.toLowerCase();
    switch (direction) {
      case "up":
        this.playerY -= 1;
        break;
      case "down":
        this.playerY += 1;
        break;
      case "left":
        this.playerX -= 1;
        break;
      case "right":
        this.playerX += 1;
        break;
      case "exit":
        console.log("Exiting the game. Goodbye!");
        this.gameOver = true;
        return;
      default:
        console.log("Invalid input. Use up, down, left, or right.");
        return;
    }

    // Check for out-of-bounds
    if (
      this.playerY < 0 ||
      this.playerY >= this.field.length ||
      this.playerX < 0 ||
      this.playerX >= this.field[0].length
    ) {
      console.log("You went outside the field. Game Over!");
      this.gameOver = true;
      return;
    }

    const currentTile = this.field[this.playerY][this.playerX];

    if (currentTile === hole) {
      console.log("You fell into a hole! Game Over.");
      this.gameOver = true;
    } else if (currentTile === hat) {
      console.log("You found your hat! You win!");
      this.gameOver = true;
    } else {
      this.field[this.playerY][this.playerX] = pathCharacter;
    }

    // Hard mode: add a new hole every 5 turns
    this.turns++;
    if (this.turns % 5 === 0) {
      this.addRandomHole();
    }
  }

  // Randomly add a new hole to the field
  addRandomHole() {
    let x, y;
    do {
      x = Math.floor(Math.random() * this.field[0].length);
      y = Math.floor(Math.random() * this.field.length);
    } while (this.field[y][x] !== fieldCharacter);
    this.field[y][x] = hole;
  }

  // Generate a field with given dimensions and hole percentage
  static generateField(height, width, holePercentage) {
    let field;
    do {
      field = [];
      for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
          row.push(Math.random() < holePercentage ? hole : fieldCharacter);
        }
        field.push(row);
      }

      // Place the hat randomly
      let hatX, hatY;
      do {
        hatX = Math.floor(Math.random() * width);
        hatY = Math.floor(Math.random() * height);
      } while (field[hatY][hatX] === hole);

      field[hatY][hatX] = hat;
    } while (!this.isSolvable(field)); // Ensure the field is solvable

    return field;
  }

  // Simple BFS maze solver to validate field solvability
  static isSolvable(field) {
    const height = field.length;
    const width = field[0].length;
    const visited = new Set();
    const queue = [[0, 0]];

    while (queue.length > 0) {
      const [y, x] = queue.shift();
      const key = `${y},${x}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (field[y]?.[x] === hat) return true;

      [
        [y - 1, x],
        [y + 1, x],
        [y, x - 1],
        [y, x + 1],
      ].forEach(([ny, nx]) => {
        if (
          ny >= 0 &&
          ny < height &&
          nx >= 0 &&
          nx < width &&
          !visited.has(`${ny},${nx}`) &&
          (field[ny][nx] === fieldCharacter || field[ny][nx] === hat)
        ) {
          queue.push([ny, nx]);
        }
      });
    }

    return false;
  }
}

// Create a 5x5 field with 20% holes
const generatedField = Field.generateField(5, 5, 0.2);
const game = new Field(generatedField);

// Main game loop
while (!game.gameOver) {
  game.print();
  const direction = prompt("Which way? (up, down, left, right, exit): ");
  game.move(direction);
}

console.log("Thanks for playing!");
