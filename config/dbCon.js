const mongoose = require("mongoose");
const configs = require("./config.json");
const constants = require("../utils/constants");

// mongoose
//   .connect(
//     configs.MONGO_URI + "/" + constants.MONGO_DB_NAME,
//     //  configs.MONGO_URI + "/",
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       //   useCreateIndex: true,
//     }
//   )
//   .then(() => {
//     console.log("MongoDB database connection established successfully");
//   })
//   .catch((err) => {
//     console.log(err.message);
//   });

// adminSchema.find().then((adminList) => {
//   adminList.forEach(element =>{
//     mongoose[element.db_name] = mongoose.createConnection(configs.MONGO_URI + `/${element.db_name}`, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       //   useCreateIndex: true,
//     });
//     console.log(".............element......."+element.db_name)
//   })
//    }).catch(err =>{
//    //  console.log(".............error......."+err)
//    });  



// mongoose.secondDb = mongoose.createConnection(configs.MONGO_URI + "/secondDb", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     //   useCreateIndex: true,
//   });

module.exports = mongoose
