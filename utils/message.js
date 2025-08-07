const constants = require("./constants");


module.exports.NOTICE = (language) => {
  return constants.LANGUAGE_BN == language ? "নোটিশ" : "Notice";
};
module.exports.EXAM_ROUTINE = (language) => {
  return constants.LANGUAGE_BN == language ? "পরীক্ষার রুটিন" : "Exam Routine";
};
module.exports.NEW_EXAM_ROUTINE_UPLOADED = (language) => {
  return constants.LANGUAGE_BN == language ? "নতুন পরীক্ষার রুটিন প্রকাশ করা হয়েছে" : "New Exam Routine Uploaded";
};
module.exports.CLASS_ROUTINE = (language) => {
  return constants.LANGUAGE_BN == language ? "ক্লাস রুটিন" : "Class Routine";
};
module.exports.NEW_CLASS_ROUTINE_UPLOADED = (language) => {
  return constants.LANGUAGE_BN == language ? "নতুন ক্লাস রুটিন প্রকাশ করা হয়েছে" : "New Class Routine Uploaded";
};

module.exports.COMMENT = (language) => {
  return constants.LANGUAGE_BN == language ? "মন্তব্য" : "Comment";
};

module.exports.NEW_COMMENT = (language) => {
  return constants.LANGUAGE_BN == language ? "নতুন মন্তব্য" : "New comment";
};
module.exports.NEW_COMMENT_ADDED = (language) => {
  return constants.LANGUAGE_BN == language ? "নতুন মন্তব্য যোগ করা হয়েছে" : "New comment added";
};
module.exports.FEE = (language) => {
  return constants.LANGUAGE_BN == language ? "ফি" : "Fee";
};
module.exports.NEW_FEE_UPLOADED = (language) => {
  return constants.LANGUAGE_BN == language ? "নতুন ফি প্রকাশ করা হয়েছে" : "New Fee Uploaded";
};

module.exports.FEE_PAYMENT = (language) => {
  return constants.LANGUAGE_BN == language ? "আপনার ফি প্রদান সফলভাবে সম্পন্ন হয়েছে" : "your fee payment successfully done";
};
module.exports.HOME_WORK = (language) => {
  return constants.LANGUAGE_BN == language ? "বাড়ির কাজ" : "HomeWork";
};
module.exports.NEW_HOMEWORK_UPLOADED = (language) => {
  return constants.LANGUAGE_BN == language ? "নতুন বাড়ির কাজ প্রকাশ করা হয়েছে" : "New HomeWork Uploaded";
};
module.exports.EXAM_MARK = (language) => {
  return constants.LANGUAGE_BN == language ? "পরীক্ষার মার্ক" : "Exam Mark";
};

module.exports.NEW_EXAM_MARK_UPLOADED = (language) => {
  return constants.LANGUAGE_BN == language ? "নতুন পরীক্ষার মার্ক প্রকাশ করা হয়েছে" : "New Exam Mark Uploaded";
};
module.exports.ALREADY_EXISTS = (language) => {
  return constants.LANGUAGE_BN == language
    ? "ইতিমধ্যেই বিদ্যমান"
    : "Already Exists";
};
module.exports.FAILED = (language) => {
  return constants.LANGUAGE_BN == language ? "ব্যর্থ হয়েছে" : "Failed";
};
module.exports.SUCCESS = (language) => {
  return constants.LANGUAGE_BN == language ? "সফল হয়েছে" : "Success";
};

module.exports.comment_sent = (language) => {
  return constants.LANGUAGE_BN == language ? "মন্তব্য পাঠানো হয়েছে" : "Comment sent";
};

module.exports.comment_update = (language) => {
  return constants.LANGUAGE_BN == language ? "মন্তব্য আপডেট করা হয়েছে" : "Comment updated";
};
module.exports.WRONG_USER = (language) => {
  return constants.LANGUAGE_BN == language ? "ভুল ব্যবহারকারী" : "Wrong User";
};
module.exports.WRONG_PASSWORD = (language) => {
  return constants.LANGUAGE_BN == language ? "ভুল পাসওয়ার্ড" : "Wrong Password";
};
module.exports.OLD_PASSWORD_WRONG = (language) => {
  return constants.LANGUAGE_BN == language ? "পুরানো পাসওয়ার্ড ভুল" : "Old Password Wrong";
};
module.exports.DELETED_SUCCESSFULLY = (language) => {
  return constants.LANGUAGE_BN == language
    ? "সফলভাবে মুছে ফেলা হয়েছে"
    : "Item deleted successfully";
};
module.exports.NOT_FOUND = (language) => {
  return constants.LANGUAGE_BN == language ? "পাওয়া যায়নি" : "Not found";
};
module.exports.FAILED_TO_DELETE = (language) => {
  return constants.LANGUAGE_BN == language
    ? "মুছে ফেলতে ব্যর্থ হয়েছে৷"
    : "Failed to delete";
};
module.exports.UPDATED_SUCCESSFULLY = (language) => {
  return constants.LANGUAGE_BN == language
    ? "সফলভাবে হাল নাগাদ করা হয়েছে৷"
    : "Updated successfully";
};


module.exports.INVALID_REQUEST_CLASS_ROOM_NOT_ALLOWED = (language) => {
  return constants.LANGUAGE_BN == language ? "ভুল অনুরোধ, ক্লাস রুম অনুমোদিত নয়" : "Invalid request,Class room not allowed";
};

module.exports.QUERY_PARAMETERS_IS_REQUIRED = (language) => {
  return constants.LANGUAGE_BN == language ? "কিছু জিজ্ঞাসা করা প্রয়োজন" : "Query parameters is required";
};
module.exports.NOT_ALLOWED_TO_CHANGE_CLASS_ROOM_HERE = (language) => {
  return constants.LANGUAGE_BN == language ? "এখানে ক্লাস রুম পরিবর্তন করার অনুমতি নেই" : "Not allowed to change class room here";
};
module.exports.THIS_PROMOTION_CYCLE_ALREADY_DONE = (language) => {
  return constants.LANGUAGE_BN == language ? "এই উত্তরণ চক্র ইতিমধ্যে সম্পন্ন" : "This Promotion cycle already done";
};

module.exports.INTERNEL_SERVER_ERROR = (language) => {
  return constants.LANGUAGE_BN == language ? "অভ্যন্তরীণ সার্ভার ত্রুটি৷" : "Internal server error";
};
module.exports.ALREADY_PROMOTED_TO_NEXT_CLASS_NOT_ALLOWED_TO_DELETE_HERE = (language) => {
  return constants.LANGUAGE_BN == language ? "ইতিমধ্যে পরবর্তী ক্লাসে উন্নীত হয়েছে, এখানে মুছে ফেলার অনুমতি নেই" : "Already prmoted to next class, Not allowed to delete here";
};


