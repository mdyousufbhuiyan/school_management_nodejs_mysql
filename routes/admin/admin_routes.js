const express = require("express");
const utils = require("../../utils/util_methods");
const router = express.Router();
const adminController = require('../../controllers/admin_controller/admin_controller');
const geoController = require('../../controllers/bd_geo_controller')
const subjectsController = require('../../controllers/subjects_controller')
const classController = require('../../controllers/class_controller')
const classRoomController = require('../../controllers/class_room_controller');

const teacherController = require('../../controllers/teacher_controller')
const studentController = require('../../controllers/students_controller');
const classStudentController = require('../../controllers/class_students_controller');
const classRoutineController = require('../../controllers/class_routine_controller');
const attendenceController = require('../../controllers/attendence_controller');
const gradingController = require('../../controllers/grading_scale_controller');

const examTypeController = require('../../controllers/exam_type_controller');
const examMarkController = require('../../controllers/exam_mark_controller');
const weekController = require('../../controllers/weeks_controller');
const academicYearController = require('../../controllers/academic_year_controller');
const groupNameController = require('../../controllers/group_name_controller');
const timeSlotController = require('../../controllers/time_slot_controller');
const examRoutineController = require('../../controllers/exam_routine_controller');
const feeTypeController = require('../../controllers/fee_type_controller');
const classFeesController = require('../../controllers/class_fees_controller');
const feeCollectionController = require('../../controllers/fee_collection_controller');

const utilController = require('../../controllers/utils_controller');
const appLanguageController = require('../../controllers/app_language_controller');

const homeWorkRoutineController = require('../../controllers/home_work_controller');

const noticeController = require('../../controllers/notice_controller');
const holidayController = require('../../controllers/holiday_controller');

const multipartHandler = require('../../middlewares/mulipart_handler');

const loginController = require('../../controllers/auth_controller')




// Retrieve all admins
router.get("/user", utils.extractToken, adminController.retrieveAllAdmins);

// Retrieve admin  by ID
router.get("/user/:id", utils.extractToken, adminController.retrieveAdminById);

// // Retrieve admin  by ID
// router.post("/retrieveList", utils.extractToken, adminController.retrieveList);

//Add new admin
router.post("/user", adminController.addNewAdmin);
//update
//router.put("/user/:id", utils.extractToken, adminController.update);
router.put("/user/:id",adminController.update);
router.delete("/user/:id", utils.extractToken, adminController.deleteCon);
// router.get("/find", adminController.find);


//login
router.post("/login", loginController.loginController);


// Verify whether the token is correct

// router.post("/verifyToken", utils.extractToken,loginController.verifyTokenCon);
//util controller......................
router.get("/duration", utilController.getAllDurations);
//...............languages.........................
router.get("/selected-app-language/", utilController.getAllLanguageas);
router.post("/app-language/", appLanguageController.addAppLanguage, utilController.getAllLanguageas);
router.get("/app-language/", appLanguageController.getAllAppLanguages);
router.put("/app-language/:id", appLanguageController.updateAppLanguages, utilController.getAllLanguageas);
//bd geo......................
router.get("/division", geoController.getAllDivision);
router.get("/district", geoController.getAllDistrict);
router.get("/district/:id", geoController.getAllDistrictByDivId);
router.get("/upazilla", geoController.getAllUpazilla);
router.get("/upazilla/:id", geoController.getAllUpazillaByDistId);
router.get("/union", geoController.getAllUnion);
router.get("/union/:id", geoController.getAllUnionByUpazillaId);
//subjects
router.post("/subject",utils.extractToken, subjectsController.addSubsects);
router.get("/subject",utils.extractToken, subjectsController.getAllSubjects);
router.get("/subject-only-dropdown", utils.extractToken, subjectsController.getAllSubjectsForDropdown);

router.get("/subject/:id",utils.extractToken, subjectsController.getSubjectById);
router.put("/subject/:id", utils.extractToken, subjectsController.updateSubjects);
router.delete("/subject/:id",utils.extractToken, subjectsController.deleteSubjects);
router.get(
  "/class-wise-subject",
  utils.extractToken,
  classRoutineController.getAllSubjectsAccordingToClassroom
);



// class
router.post("/class", utils.extractToken, classController.addClasses);
router.get("/class", utils.extractToken, classController.getAllClasses);
router.get("/class-only-dropdown", utils.extractToken, classController.getAllClassesForDropdown);


router.get("/class/:id", utils.extractToken, classController.getClassByClassId);
router.put("/class/:id", utils.extractToken, classController.updateClasses);
router.delete("/class/:id",utils.extractToken, classController.deleteClass);

// academicyear...........
//router.post("/academic-year",  academicYearController.addAcademicYear);
router.get("/academic-year",  academicYearController.getAllAcademicYear);
router.get("/academic-year/:id",  academicYearController.getAcademicYearById);
//router.put("/academic-year/:id", academicYearController.updateAcademicYear);
//router.delete("/academic-year/:id",  academicYearController.deleteAcademicYear);
// week
router.post("/week",  weekController.addWeekName);
router.get("/week",  weekController.getAllWeekName);
router.get("/week/:id",  weekController.getWeekByWeekId);
router.put("/week/:id", weekController.updateWeeks);
router.delete("/week/:id",  weekController.deleteWeeks);
// class group name
//router.post("/group-name",  weekController.addWeekName);
router.get("/group-name",  groupNameController.getAllGroupName);
router.get("/group-name/:id",  groupNameController.getGroupNameById);
//router.put("/week/:id", weekController.updateWeeks);
//router.delete("/week/:id",  weekController.deleteWeeks);
// time slot
router.post("/time-slot",utils.extractToken, timeSlotController.addTimeSlot);
router.get("/time-slot",utils.extractToken, timeSlotController.getAllTimeSlot);
router.get("/time-slot/:id",utils.extractToken, timeSlotController.getTimeSlotById);
router.get("/time-slot-only-dropdown",utils.extractToken, timeSlotController.getAllTimeSlotOnlyDropdown);

router.put("/time-slot/:id", utils.extractToken, timeSlotController.updateTimeSlot);
router.delete("/time-slot/:id",utils.extractToken,   timeSlotController.deleteTimeSlot);

// teacher 
router.post("/teacher",  utils.extractToken,teacherController.addTeacher);
router.get("/teacher", utils.extractToken,teacherController.getAllTeachers);

router.get("/teacher-only-dropdown",  utils.extractToken,teacherController.getAllTeachersForDropdown);

router.get("/teacher/:id", utils.extractToken,teacherController.getTeacherById);
router.put("/teacher/:id", utils.extractToken, teacherController.updateTeachers);
router.delete("/teacher/:id", utils.extractToken, teacherController.deleteTeachers);
//router.get("/teacher_with_class_room_details",  utils.extractToken,teacherController.getTeacherWithClassInfo);
//router.get("/teacher_with_class_room_details/:id",  utils.extractToken,teacherController.getTeacherByTeacherIdWithClassInfo);
router.get("/count-teacher-by-gender",utils.extractToken,teacherController.countTeachersByGender);
router.get(
  "/class-wise-teacher",
  utils.extractToken,
  classRoutineController.getAllTeachersAccordingToClassroom
);

// student 
router.post("/student",  utils.extractToken,classStudentController.isValidClassRoomToChange, studentController.addStudent,classStudentController.addClassStudent);
//router.get("/student",  utils.extractToken,studentController.getAllStudents);
router.get("/student",  utils.extractToken,classStudentController.getClassAllStudent);
//router.get("/student/:id",  utils.extractToken,studentController.getStudentById);
router.get("/student/:id",  utils.extractToken,classStudentController.getStudentByStudentId);
router.put("/student/:id", utils.extractToken,classStudentController.isValidClassRoomToChange, studentController.updateStudent,classStudentController.updateClassStudentBeforePromotion);
//router.delete("/student/:id", utils.extractToken, studentController.deleteStudent,classStudentController.deleteStudentFromStudentPortal);
router.delete("/student/:id", utils.extractToken,classStudentController.deleteStudentFromStudentPortal);
//router.get("/search-student", utils.extractToken,studentController.getFileteredStudents);
router.post("/student-promotion",utils.extractToken,classStudentController.isValidClassRoomToChange,classStudentController.validatePromotion,classStudentController.promotionToNextClass);
//class student...
router.get("/student-global-search",utils.extractToken,classStudentController.studentGolobalSearch);
// router.get("/class-student",  utils.extractToken,classStudentController.getClassAllStudent);
router.get("/count-students-by-gender",utils.extractToken,studentController.countStudentsByGender);



// class rooms
router.post("/class-room",utils.extractToken, classRoomController.addClassRoom);
router.get("/class-room/",utils.extractToken,classRoomController.getLatestAcademicYear, classRoomController.getAllClassRooms);
router.get("/class-room-only-dropdown", utils.extractToken, classRoomController.getAllClassRoomsForDropDown);
router.delete("/class-room/:id", utils.extractToken,classRoomController.deleteClassRooms);
router.put("/class-room/:id", utils.extractToken,classRoomController.updateClassRooms);


//.............class routine.................
router.post("/class-routine", utils.extractToken, classRoutineController.addClassRoutine);
// class time table 
//router.post("/class-time-table",utils.extractToken, classTimeTableController.addClassTime);
router.get("/class-routine", utils.extractToken,classRoutineController.getLatestAcademicYear,classRoutineController.getAllClassRoutine);


// router.get("/class-wise-subject-list",  utils.extractToken,classTimeTableController.getClassWiseSubjectList);
router.get("/class-routine/:id",utils.extractToken,classRoutineController.getAllClassRoutineById);
router.put("/class-routine/:id", utils.extractToken, classRoutineController.updateClassRoutine);
router.delete("/class-routine/:id",utils.extractToken, classRoutineController.deleteClassRoutine);


// attendence 
router.post("/attendance", utils.extractToken, attendenceController.addAttendence);
//router.get("/attendance",  utils.initializeAllSchema, utils.extractToken,attendenceController.getAllAttendence);
router.get("/attendance",  utils.extractToken,attendenceController.getAllAttendence);
router.get("/search-attendance",   utils.extractToken,attendenceController.getFilteredAttendance);
router.get("/search-attendance-with-students-details",   utils.extractToken,attendenceController.getAttendanceWithStudentsDetails);
router.put("/attendance/:id", utils.extractToken, attendenceController.updateAttendance);
router.delete("/attendance/:id", utils.extractToken, attendenceController.deleteAttendence);

// grading
router.post("/grading-scale", utils.extractToken, gradingController.addGrading);
router.get("/grading-scale",utils.extractToken,gradingController.getAllGrading);
router.get("/grading-scale-only-dropdown", gradingController.getAllGradingForDropdown);
router.get("/grading-scale/:id", utils.extractToken, gradingController.getGradingById);
router.put("/grading-scale/:id",  utils.extractToken,gradingController.updateGrading);
router.delete("/grading-scale/:id",utils.extractToken,gradingController.deleteGrading);


// exam type
router.post("/exam-type", utils.extractToken, examTypeController.addExamType);
router.get("/exam-type",utils.extractToken,examTypeController.getAllExamType);
router.get("/exam-type-only-dropdown", examTypeController.getAllExamTypeForDropdown);
router.get("/exam-type/:id", utils.extractToken, examTypeController.getExamTypeByExamTypeId);
router.put("/exam-type/:id",  utils.extractToken,examTypeController.updateExamType);
router.delete("/exam-type/:id",utils.extractToken,examTypeController.deleteExamType);


// exam routine 
router.post("/exam-routine", utils.extractToken, examRoutineController.addExamRoutine);
router.get("/exam-routine",  utils.extractToken,examRoutineController.getLatestAcademicYear,examRoutineController.getAllExamRoutine);
router.get("/exam-routine/:id",  utils.extractToken,examRoutineController.getExamRoutineById);
// router.get("/single-student-exam-mark",  utils.extractToken,examRoutineController.getSingleStudentExamMark);
 //router.get("/exam-routine-general-search",  utils.extractToken, examRoutineController.generalSearchForExamRoutine);
router.put("/exam-routine/:id", utils.extractToken, examRoutineController.updateExamRoutine);
router.delete("/exam-routine/:id", utils.extractToken, examRoutineController.deleteExamRoutine);


// mark 
router.post("/exam-mark",  utils.extractToken, examMarkController.addExamMark);
router.get("/exam-mark", utils.extractToken,examMarkController.getAllExamMark);
router.get("/search-exam-mark",utils.extractToken,examMarkController.getFilteredExamMark);
router.put("/publish-mark/:id",  utils.extractToken, examMarkController.publishMark);
router.put("/exam-mark/:id",  utils.extractToken, examMarkController.updateExamMark);
router.delete("/exam-mark/:id",  utils.extractToken, examMarkController.deleteExamMark);


//.............fee type
router.post("/fee-type",utils.extractToken, feeTypeController.addFeeType);
router.get("/fee-type",utils.extractToken, feeTypeController.getAllFeeTypes);
router.get("/fee-type-only-dropdown", utils.extractToken, feeTypeController.getAllFeeTypesForDropdown);

router.get("/fee-type/:id",utils.extractToken, feeTypeController.getFeeTypeById);
router.put("/fee-type/:id", utils.extractToken, feeTypeController.updateFeeType);
router.delete("/fee-type/:id",utils.extractToken, feeTypeController.deleteFeeType);

// class fee
router.post("/class-fees",utils.extractToken,classFeesController.addClassFees);
router.get("/class-fees",utils.extractToken, classFeesController.getAllClassFees);
router.get("/search-class-fees",utils.extractToken, classFeesController.getFilteredClassFees);
router.get("/filtered-class-fees",utils.extractToken, classFeesController.getClassFeesByQueryPerm);

router.get("/class-fees/:id",utils.extractToken, classFeesController.getClassFeesById);
router.put("/class-fees/:id", utils.extractToken, classFeesController.updateClaaFees);
router.delete("/class-fees/:id",utils.extractToken, classFeesController.deleteClassFees);

//  fee collection........
router.post("/fee-collection",utils.extractToken,feeCollectionController.addUpdateCollection);
router.get("/fee-collection",utils.extractToken, feeCollectionController.getAllCollection);



// home work
router.post("/home-work", utils.extractToken, homeWorkRoutineController.addHomeWork);
 router.get("/home-work",utils.extractToken,homeWorkRoutineController.getAllHomeWork);
router.get("/home-work/:id", utils.extractToken,homeWorkRoutineController.getHomeWorkBuId);
router.put("/home-work/:id",utils.extractToken, homeWorkRoutineController.updateHomeWork);
router.delete("/home-work/:id", utils.extractToken, homeWorkRoutineController.deleteHomeWork);

// Notice
router.post("/notice", utils.extractToken, noticeController.addNotice);
 router.get("/notice",utils.extractToken,noticeController.getAllNotice);
 router.get("/notice/:id", utils.extractToken,noticeController.getNoticeById);
router.put("/notice/:id",utils.extractToken, noticeController.updateNotice);
router.delete("/notice/:id", utils.extractToken, noticeController.deleteNotice);
router.get("/notice-dashboard",utils.extractToken,noticeController.getNoticesForDashBoard);
// holiday
router.post("/holiday", utils.extractToken, holidayController.addHoliday);
 router.get("/holiday",utils.extractToken, holidayController.getLatestAcademicYear,holidayController.getAllHoliday);
 router.get("/holiday/:id", utils.extractToken,holidayController.getHolidayById);
router.put("/holiday/:id",utils.extractToken, holidayController.updateHoliday);
router.delete("/holiday/:id", utils.extractToken, holidayController.deleteHoliday);


router.post("/file-upload", multipartHandler.upload.single("attachment"),multipartHandler.uploadAttachment,multipartHandler.deletOldFileAfterUpdating);


module.exports = router;
