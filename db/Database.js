// const mongoose = require('mongoose');

// const connectDatabase = () => {
//     mongoose.connect(process.env.DB_URL, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     }).then((data) => {
//         console.log(`mongodb is connected with server: ${process.env.DB_URL}`);
//     })
// }

// module.exports = connectDatabase

const mongoose = require("mongoose");

const connectDatabase = async () => {
    const MONGO_URI = process.env.NODE_ENV === "test" ? process.env.MONGO_URI_TEST : process.env.DB_URL;

    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Connected to ${process.env.NODE_ENV === "test" ? "TEST" : "MAIN"} database`);
    } catch (error) {
        console.error(`Error connecting to database: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDatabase;
