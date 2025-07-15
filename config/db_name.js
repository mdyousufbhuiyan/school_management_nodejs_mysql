const {mongoose} = require('../config/dbCon')
module.exports = function (userId) {
  let myPromise = new Promise(function (myResolve, myReject) {
    let x = 0;

    // The producing code (this may take some time)
    myResolve(mongoose[userId]);
    // if (userId == 'admin') {
    //   myResolve(mongoose[userId]);
    // } else if(userId=='meeting'){
    //     myResolve(mongoose.secondDb);
  
    // }else{
    //     myReject("Error");
    // }
  });

  return myPromise;
};
