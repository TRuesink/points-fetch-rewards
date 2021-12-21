const calculateTotals = (data) => {
  // init empty object for point totals
  const totalPoints = {};
  // loop over the transactions in the database
  data.forEach((transaction) => {
    if (!totalPoints[transaction.payer]) {
      totalPoints[transaction.payer] = transaction.points;
    } else {
      totalPoints[transaction.payer] += transaction.points;
    }
  });
  return totalPoints;
};

module.exports = calculateTotals;
