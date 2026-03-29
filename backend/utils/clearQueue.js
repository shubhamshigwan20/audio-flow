const { connection } = require("./queue");

const clearQueue = async () => {
  await connection.flushall();
};

clearQueue();
