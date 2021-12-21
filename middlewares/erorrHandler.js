// Customer error handler function.
// When a route handler throws an error (throw new Error("message") )
// This funciton takes the error object, logs the stack trace, sends json to the client.
const errorHandler = (err, req, res, next) => {
  //   let error = { ...err };

  console.log(err.stack.red.bold);

  res.json({
    success: false,
    error: err.message || "server error",
  });
};

module.exports = errorHandler;
