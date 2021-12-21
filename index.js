const express = require("express");
require("colors");
if (process.env.NODE_ENV === "development") {
  const dotenv = require("dotenv");
  dotenv.config({ path: "./config/config.env" });
}
// custom error handler
const errorHandler = require("./middlewares/erorrHandler");
const calculateTotalPoints = require("./utils/calculateTotalPoints");

// calcualteTotals function
const calculateTotals = require("./utils/calculateTotals");

// initialize in memory database
const database = [
  { payer: "DANNON", points: 1000, timestamp: "2020-11-02T14:00:00Z" },
  { payer: "UNILEVER", points: 200, timestamp: "2020-10-31T11:00:00Z" },
  { payer: "DANNON", points: -200, timestamp: "2020-10-31T15:00:00Z" },
  { payer: "MILLER COORS", points: 10000, timestamp: "2020-11-01T14:00:00Z" },
  { payer: "DANNON", points: 300, timestamp: "2020-10-31T10:00:00Z" },
];

// create server
const app = express();
app.use(express.json());

// --------------------------------------- get total points ---------------------------------------
app.get("/api/v1/points", (req, res) => {
  const totalPoints = calculateTotals(database);
  res.json({ success: true, data: totalPoints });
});

// ------------------------------------ add transactions -------------------------------------------
app.post("/api/v1/points", (req, res, next) => {
  const transaction = req.body;
  if (!transaction.payer) {
    return next(new Error("Payer was not specified in request"));
  }
  if (!transaction.points) {
    return next(new Error("Points were not specified in request"));
  }
  if (!transaction.timestamp) {
    return next(new Error("timestamp was not specified in request"));
  }
  if (!Date.parse(transaction.timestamp)) {
    return next(new Error("timestamp is not in a valid date format"));
  }
  if (typeof transaction.points !== "number") {
    return next(new Error("Points were not a valid number"));
  }

  database.push(transaction);
  res.json({ success: true, data: database });
});

// ------------------------------------- spend points -------------------------------------------
app.post("/api/v1/points/spend", (req, res, next) => {
  // check request for errors
  let deduction = req.query.points;
  if (!deduction) {
    return next(
      new Error("There was no point value specified in the request params")
    );
  }
  if (typeof parseInt(deduction) !== "number") {
    return next(new Error("Points were not a valid number"));
  }
  if (parseInt(deduction) <= 0) {
    return next(new Error("Spend amount must be greater than 0"));
  }
  const total = calculateTotalPoints(database);
  if (deduction > total) {
    return next(
      new Error(
        `There are only ${total} points in your account. You attempted to spend ${deduction} points.`
      )
    );
  }

  // sort transactions and separate credits (positive points) from debits (negative points)
  const credits = database
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
    .filter((transaction) => transaction.points > 0);
  const debits = database.filter((transaction) => transaction.points < 0);

  // Caclulate debit totals for each payer
  let debitTotals = calculateTotals(debits);

  // init object which will track how many points are subtracted from each payer given the deduction request
  let payerSpend = {};
  // init iteration counter
  let i = 0;
  // start looping through credits (sorted positive point transactions)
  // while the deduction > 0
  while (deduction > 0) {
    // get the payer for currnet transaction
    const payer = credits[i].payer;
    // if there are any debits (negative point transactions) get the total for this payer
    const totalDebit = debitTotals[payer] ? debitTotals[payer] : 0;
    // calculate the amount remaining for the current transactions, post applying total debit.
    const amountRemaing = credits[i].points + totalDebit;
    // if the amount remaining is > 0
    if (amountRemaing > 0) {
      // set the total debit for this payer = 0
      debitTotals[payer] = 0;
      // calculate point deduction: if the requested deduction is greater than the amount remaining, set pointDeduction = the amnount remainig. Else set it to 0
      const pointDeduction =
        deduction > amountRemaing ? amountRemaing : deduction;
      // populate the payerSpend object
      if (!payerSpend[payer]) {
        payerSpend[payer] = -1 * pointDeduction;
      } else {
        payerSpend[payer] -= pointDeduction;
      }
      // update the deduction amount
      deduction -= pointDeduction;
    } else {
      // if the amount remaining was less than or equal to 0, update the debit Total to be the amount remaining, and do nothing else.
      debitTotals[payer] = amountRemaing;
    }
    // update counter
    i++;
  }
  // create new transactions
  newTransactions = Object.keys(payerSpend).map((payer) => {
    return {
      payer: payer,
      points: payerSpend[payer],
      timestamp: new Date().toISOString(),
    };
  });

  // add transactions to the database
  database.push(...newTransactions);

  res.json({
    success: true,
    data: newTransactions.map((transaction) => {
      return { payer: transaction.payer, points: transaction.points };
    }),
  });
});

//use custom error handler
app.use(errorHandler);

// define port
const PORT = process.env.PORT || 5000;

// list on port
app.listen(PORT, () => {
  console.log(
    `Service running on port ${PORT} in ${process.env.NODE_ENV} mode.`.cyan
  );
});
