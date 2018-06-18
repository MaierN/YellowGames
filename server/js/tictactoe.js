
function play(playState, data, connection) {
  if (playState[playState.next] !== connection) return;
  const row = data.row;
  const col = data.col;
  if (typeof row !== "number" || typeof col !== "number") return;
  if (row < 0 || row > 2 || col < 0 || col > 2) return;
  if (playState.grid[row][col] !== "") return;
}

module.exports = {
  play,
};
