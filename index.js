const express = require("express");
const colors = require("colors");
if (process.env.NODE_ENV === "development") {
  const dotenv = require("dotenv");
  dotenv.config({ path: "./config/config.env" });
}
const errorHandler = require("./middlewares/erorrHandler");

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

// get transactions
app.get("/api/v1/points", (req, res) => {
  res.json({ success: true, data: database });
});

// add transactions
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

// use points
app.put("/api/v1/points", (req, res) => {
  const deduction = req.params.points;
  const sortedTransactions = database.sort(
    (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)
  );
  console.log(sortedTransactions);
  res.json({ success: true, data: sortedTransactions });
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
  console.log(process.env.TEST_VAR);
});
