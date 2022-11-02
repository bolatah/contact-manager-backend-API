const mongoose = require("mongoose");

require("dotenv").config();

/**
 * -------------- DATABASE ----------------
 */

/**
 * Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 * string into the `.env` file
 *
 * DB_STRING=mongodb://<user>:<password>@localhost:27017/database_name
 * DB_STRING_PROD=<your production database string>
 */

// Connect to the correct environment database
mongoose.connect(process.env.DB_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Database connected");
});

/* const devConnection = process.env.DB_STRING;
const prodConnection = process.env.DB_STRING_PROD;

if (process.env.NODE_ENV === "production") {
  mongoose.connect(prodConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection.on("connected", () => {
    console.log("Database connected");
  });
} else {
  mongoose.connect(devConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection.on("connected", () => {
    console.log("Database connected");
  });
}
 */