const mongoose = require ("mongoose");
require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser:true,
        useUnifiedTopology:true,
         
    })
    .then(() => console.log("DB connected Successfully"))
    .catch((error) => {
        console.log("DB connection error");
        console.log(error);
        process.exit(1);
    })
};
// https://documenter.getpostman.com/view/24441701/2s93kz6REm