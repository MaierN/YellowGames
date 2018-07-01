
const colors = ["#000000", "#8e0000", "#007a14", "#002e7a", "#6b007a"];

function getColor(id) {
  return colors[id % colors.length];
}

module.exports = {
  getColor,
};
