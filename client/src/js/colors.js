
const colors = ["#007a14", "#8aff42", "#41efff", "#9c56ff", "#fa7aff", "#ff6060", "#ffde23", "#38ffc0", "#ffbf37"];

function getColor(id) {
  return colors[id % colors.length];
}

module.exports = {
  getColor,
};
