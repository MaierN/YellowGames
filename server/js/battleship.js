
function checkCoords(row, col) {
  if (typeof row !== "number" || typeof col !== "number") return false;
  if (row < 0 || row > 9 || col < 0 || col > 9) return false;
  return true;
}

function play(playState, data, connection) {
  const pn = connection === playState.p1 ? "P1" : "P2";
  const opn = connection === playState.p1 ? "P2" : "P1";

  if (playState.phase === 0) {
    switch (data.request) {
      case "put":
      if (!playState["boats" + pn][data.selection]) return;
      if (playState["boats" + pn][data.selection].placed) return;
      if (!checkCoords(data.row, data.col)) return;
      for (let i = 0; i < playState["boats" + pn][data.selection].size; i++) {
        if (data.row + (data.rotated ? i : 0) > 9 || data.col + (data.rotated ? 0 : i) > 9) return;
        if (playState["grid" + pn][data.row + (data.rotated ? i : 0)][data.col + (data.rotated ? 0 : i)] !== "") return;
      }
      playState["boats" + pn][data.selection].placed = true;
      playState["remaining" + pn]--;
      for (let i = 0; i < playState["boats" + pn][data.selection].size; i++) {
        playState["grid" + pn][data.row + (data.rotated ? i : 0)][data.col + (data.rotated ? 0 : i)] = data.selection;
      }

      connection.sendCustom({
        type: 'gameBattleship',
        data: {
          request: "put",
          row: data.row,
          col: data.col,
          rotated: data.rotated,
          selection: data.selection,
        }
      });
      (connection === playState.p1 ? playState.p2 : playState.p1).sendCustom({
        type: 'gameBattleship',
        data: {
          request: "ennemyPut",
          selection: data.selection,
          size: playState["boats" + pn][data.selection].size,
        }
      });

      if (playState.remainingP1 === 0 && playState.remainingP2 === 0) {
        playState.remainingP1 = 5;
        playState.remainingP2 = 5;
        playState.phase = 1;
        connection.sendCustom({
          type: 'gameBattleship',
          data: {
            request: "phase1",
          }
        });
        (connection === playState.p1 ? playState.p2 : playState.p1).sendCustom({
          type: 'gameBattleship',
          data: {
            request: "phase1",
          }
        });
      }
      break;
    }


  } else {
    switch(data.request) {
      case "attack":
      if (playState[playState.next] !== connection) return;
      if (!checkCoords(data.row, data.col)) return;
      if (playState["hits" + pn][data.row][data.col] !== "") return;

      playState.next = connection === playState.p1 ? "p2" : "p1";

      playState["hits" + pn][data.row][data.col] = "X";
      if (playState["grid" + opn][data.row][data.col] !== "") {
        const touchedBoat = playState["boats" + opn][playState["grid" + opn][data.row][data.col]];
        touchedBoat.hits++;
        if (touchedBoat.hits >= touchedBoat.size) {
          playState["remaining" + opn]--;
          connection.sendCustom({
            type: 'gameBattleship',
            data: {
              request: "attack",
              type: "sunk",
              boat: playState["grid" + opn][data.row][data.col],
              row: data.row,
              col: data.col,
              yourTurn: false,
            }
          });
          (connection === playState.p1 ? playState.p2 : playState.p1).sendCustom({
            type: 'gameBattleship',
            data: {
              request: "ennemyAttack",
              row: data.row,
              col: data.col,
              yourTurn: true,
            }
          });
          if (playState["remaining" + opn] <= 0) {
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
          }
        } else {
          connection.sendCustom({
            type: 'gameBattleship',
            data: {
              request: "attack",
              type: "touched",
              row: data.row,
              col: data.col,
              yourTurn: false,
            }
          });
          (connection === playState.p1 ? playState.p2 : playState.p1).sendCustom({
            type: 'gameBattleship',
            data: {
              request: "ennemyAttack",
              row: data.row,
              col: data.col,
              yourTurn: true,
            }
          });
        }
      } else  {
        connection.sendCustom({
          type: 'gameBattleship',
          data: {
            request: "attack",
            type: "water",
            row: data.row,
            col: data.col,
            yourTurn: false,
          }
        });
        (connection === playState.p1 ? playState.p2 : playState.p1).sendCustom({
          type: 'gameBattleship',
          data: {
            request: "ennemyAttack",
            row: data.row,
            col: data.col,
            yourTurn: true,
          }
        });
      }

      break;
    }
  }
}

module.exports = {
  play,
}
