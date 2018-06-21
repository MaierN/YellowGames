
const winPatterns = [
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],

  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],

  [[0, 0], [1, 1], [2, 2]],
  [[2, 0], [1, 1], [0, 2]],
];

function checkWin(grid) {
  for (let i = 0; i < winPatterns.length; i++) {
    const winPattern = winPatterns[i];

    let xCount = 0;
    let oCount = 0;
    for (let j = 0; j < 3; j++) {
      switch(grid[winPattern[j][0]][winPattern[j][1]]) {
        case "x": xCount++; break;
        case "o": oCount++; break;
        default: break;
      }
    }
    if (xCount === 3 || oCount === 3) return true;
  }

  return false;
}

function checkFull(grid) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i][j] === "") return false;
    }
  }
  return true;
}

function play(playState, data, connection) {
  if (playState[playState.next] !== connection) return;
  const row = data.row;
  const col = data.col;
  if (typeof row !== "number" || typeof col !== "number") return;
  if (row < 0 || row > 2 || col < 0 || col > 2) return;
  if (playState.grid[row][col] !== "") return;

  playState.grid[row][col] = playState.next;

  const symbol = playState.next;

  playState.next = playState.next === "x" ? "o" : "x";

  if (checkWin(playState.grid)) {
    connection.gameState += "_1";
    playState[playState.next].gameState += "_1";
    connection.sendCustom({
      type: 'game',
      request: 'victory',
    });
    playState[playState.next].sendCustom({
      type: 'game',
      request: 'defeat',
    });
  } else if (checkFull(playState.grid)) {
    connection.gameState += "_1";
    playState[playState.next].gameState += "_1";
    connection.sendCustom({
      type: 'game',
      request: 'draw',
    });
    playState[playState.next].sendCustom({
      type: 'game',
      request: 'draw',
    });
  }

  connection.sendCustom({
    type: 'gameTicTacToe',
    data: {
      row,
      col,
      symbol,
      yourTurn: false,
    }
  });
  playState[playState.next].sendCustom({
    type: 'gameTicTacToe',
    data: {
      row,
      col,
      symbol,
      yourTurn: true,
    }
  });
}

module.exports = {
  play,
};
