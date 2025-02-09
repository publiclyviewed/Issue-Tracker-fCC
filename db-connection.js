const mongoose = require("mongoose");
require('dotenv').config(); 

mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true, 
    useNewUrlParser: true,    
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});

module.exports = mongoose.connection;
