
const winPatterns = [
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [-1, 0], [-2, 0], [-3, 0]],
  [[0, 0], [0, -1], [0, -2], [0, -3]],
  [[0, 0], [1, 1], [2, 2], [3, 3]],
  [[0, 0], [1, -1], [2, -2], [3, -3]],
  [[0, 0], [1, -1], [2, -2], [3, -3]],
  [[0, 0], [-1, 1], [-2, 2], [-3, 3]],
];

function checkWin(grid) {
  for (let i = 0; i < winPatterns.length; i++) {
    const winPattern = winPatterns[i];

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        let xCount = 0;
        let oCount = 0;
        for (let j = 0; j < 4; j++) {
          const rowN = row  + winPattern[j][0];
          const colN = col + winPattern[j][1];
          if (rowN < 0 || rowN >= 6 || colN < 0 || colN >= 7) break;
          switch(grid[rowN][colN]) {
            case "x": xCount++; break;
            case "o": oCount++; break;
            default: break;
          }
        }
        if (xCount === 4 || oCount === 4) return true;
      }
    }
  }

  return false;
}

function checkFull(grid) {
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 7; j++) {
      if (grid[i][j] === "") return false;
    }
  }
  return true;
}

function play(playState, data, connection) {
  if (playState[playState.next] !== connection) return;
  const col = data.col;
  if (typeof col !== "number") return;
  if (col < 0 || col > 6) return;
  if (playState.grid[0][col] !== "") return;

  let row = 0;
  for (let i = 5; i >= 0; i--) {
    if (playState.grid[i][col] === "") {
      row = i;
      playState.grid[i][col] = playState.next;
      break;
    }
  }

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
    type: 'gameConnectFour',
    data: {
      row,
      col,
      symbol,
      yourTurn: false,
    }
  });
  playState[playState.next].sendCustom({
    type: 'gameConnectFour',
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
}
