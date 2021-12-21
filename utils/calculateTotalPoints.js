const calculateTotalPoints = (data) => {
  let total = 0;
  data.forEach((transaction) => {
    total += transaction.points;
  });
  return total;
};

module.exports = calculateTotalPoints;
