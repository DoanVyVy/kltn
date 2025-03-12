// Optimize grid generation functions
export const generateLetterGrid = (size: number, words: string[]) => {
  // Create empty matrix
  const grid: string[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(""))

  // Possible directions to place words
  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal down
    [-1, 1], // diagonal up
  ]

  // Try to place each word on the grid
  for (const word of words) {
    let placed = false
    let attempts = 0
    const maxAttempts = 100

    while (!placed && attempts < maxAttempts) {
      attempts++

      // Choose random direction
      const direction = directions[Math.floor(Math.random() * directions.length)]

      // Choose starting position
      const startRow = Math.floor(Math.random() * size)
      const startCol = Math.floor(Math.random() * size)

      // Check if word can be placed
      if (canPlaceWord(grid, word, startRow, startCol, direction, size)) {
        placeWord(grid, word, startRow, startCol, direction)
        placed = true
      }
    }
  }

  // Fill empty cells with random letters
  fillEmptyCells(grid, size)

  return grid
}

// Check if word can be placed
export const canPlaceWord = (
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: number[],
  size: number,
) => {
  const [dRow, dCol] = direction
  const endRow = startRow + dRow * (word.length - 1)
  const endCol = startCol + dCol * (word.length - 1)

  // Check if word fits within grid boundaries
  if (endRow >= size || endRow < 0 || endCol >= size || endCol < 0) {
    return false
  }

  // Check if word overlaps with existing letters
  for (let i = 0; i < word.length; i++) {
    const row = startRow + dRow * i
    const col = startCol + dCol * i
    const currentCell = grid[row][col]

    if (currentCell !== "" && currentCell !== word[i]) {
      return false
    }
  }

  return true
}

// Place word on grid
export const placeWord = (grid: string[][], word: string, startRow: number, startCol: number, direction: number[]) => {
  const [dRow, dCol] = direction

  for (let i = 0; i < word.length; i++) {
    const row = startRow + dRow * i
    const col = startCol + dCol * i
    grid[row][col] = word[i]
  }
}

// Fill empty cells with random letters
const fillEmptyCells = (grid: string[][], size: number) => {
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === "") {
        grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26)) // A-Z
      }
    }
  }
}

// Create grid data for the game
export const createGridData = (words: { word: string; definition: string; found: boolean }[]) => {
  const wordList = words.map((w) => w.word)
  const grid = generateLetterGrid(8, wordList)

  return grid.map((row, rowIndex) =>
    row.map((letter, colIndex) => ({
      id: `${rowIndex}-${colIndex}`,
      letter,
      row: rowIndex,
      col: colIndex,
      selected: false,
    })),
  )
}

