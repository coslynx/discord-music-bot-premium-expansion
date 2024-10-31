const { MONGO_URI } = process.env;

module.exports = {
  // The MongoDB connection URI.
  uri: MONGO_URI,
  // Options for the MongoDB connection.
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
};