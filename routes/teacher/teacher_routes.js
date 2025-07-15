const express = require("express");
const utils = require("../../utils/util_methods");
const router = express.Router();
const teacherAuthController = require("../../controllers/teacher/teacher_auth_controller");
const geoController = require("../../controllers/bd_geo_controller");
const utilController = require("../../controllers/utils_controller");
const weekController = require("../../controllers/weeks_controller");
const academicYearController = require("../../controllers/academic_year_controller");
const groupNameController = require("../../controllers/group_name_controller");
const classRoomController = require("../../controllers/class_room_controller");
const studentController = require("../../controllers/students_controller");
const clssStudentController = require("../../controllers/class_students_controller");
const attendenceController = require("../../controllers/attendence_controller");
const holidayController = require("../../controllers/holiday_controller");
const subjectController = require("../../controllers/subjects_controller");
const timeSlotController = require("../../controllers/time_slot_controller");
const teacherController = require("../../controllers/teacher_controller");
const classRoutineController = require("../../controllers/class_routine_controller");
const examRoutineController = require("../../controllers/exam_routine_controller");
const examTypeController = require("../../controllers/exam_type_controller");
const feeTypeController = require("../../controllers/fee_type_controller");
const classFeesController = require("../../controllers/class_fees_controller");
const feeCollectionController = require("../../controllers/fee_collection_controller");
const noticeController = require("../../controllers/notice_controller");
const gradingController = require("../../controllers/grading_scale_controller");
const examMarkController = require("../../controllers/exam_mark_controller");


const homeWorkController = require("../../controllers/home_work_controller");

//login
router.post("/login", teacherAuthController.loginController);
router.post("/change-password/", utils.extractTeacherToken, teacherAuthController.changePasswordController);

// Verify whether the token is correct

// router.post("/verifyToken", utils.extractToken,loginController.verifyTokenCon);
//util controller......................
router.get("/duration", utilController.getAllDurations);
//...............languages.........................
router.get("/selected-app-language/", utilController.getAllLanguageas);
//bd geo......................
router.get("/division", geoController.getAllDivision);
router.get("/district", geoController.getAllDistrict);
router.get("/district/:id", geoController.getAllDistrictByDivId);
router.get("/upazilla", geoController.getAllUpazilla);
router.get("/upazilla/:id", geoController.getAllUpazillaByDistId);
router.get("/union", geoController.getAllUnion);
router.get("/union/:id", geoController.getAllUnionByUpazillaId);
router.get("/week", weekController.getAllWeekName);
router.get("/group-name", groupNameController.getAllGroupName);
router.get("/academic-year", academicYearController.getAllAcademicYear);
router.get(
  "/class-room-only-dropdown",
  utils.extractTeacherToken,
  classRoomController.getAllClassRoomsForDropDown
);
//..............studnet info...............
router.get(
  "/student-info/:id",
  utils.extractStudentToken,
  clssStudentController.getStudentLastPromotedClassRoomInfoByStudentId
);
router.put("/student/:id", utils.extractStudentToken, studentController.updateStudent);

//..............attendance info.............
router.get(
  "/attendance-particular-month",
  utils.extractStudentToken,
  attendenceController.getAttendanceForPerticularMonth
);
//..............holiday info.............
router.get(
  "/holiday-particular-month",
  utils.extractStudentToken,
  holidayController.getParticularMonthHoliday
);
//..............subject info.............
router.get(
  "/subject-only-dropdown",
  utils.extractStudentToken,
  subjectController.getAllSubjectsForDropdown
);
//..............time slot info.............
router.get("/time-slot-only-dropdown",utils.extractStudentToken, timeSlotController.getAllTimeSlotOnlyDropdown);
//..............teacher info.............
router.get("/teacher-only-dropdown",  utils.extractStudentToken,teacherController.getAllTeachersForDropdown);

//..............home work info.............
router.get(
  "/particular-date-homework",
  utils.extractTeacherToken,
  homeWorkController.getLatestHomeWorkDate,
  homeWorkController.getPreviousHomeWorkDate,
  homeWorkController.getNextHomeWorkDate,
  homeWorkController.getParticularDateHomeWork
);
//..............class routine info.............
router.get("/class_routine",  utils.extractStudentToken,classRoutineController.getAllClassRoutineByClassRoomId);
//..............exam routine info.............
router.get("/exam_routine",  utils.extractStudentToken,examRoutineController.getExamRoutineByClassRoomId);
router.get("/exam-type-only-dropdown", examTypeController.getAllExamTypeForDropdown);

//..............class fees info.............
router.get("/fee-type-only-dropdown", feeTypeController.getAllFeeTypesForDropdown);
router.get("/class-fees",utils.extractStudentToken,classFeesController.getClassFeesByClassRoomId);
router.get("/fee-collection",utils.extractStudentToken, feeCollectionController.getAllCollectionForSingleStudent);
//..............notice info.............
router.get("/notice",utils.extractStudentToken,noticeController.getAllNotice);
//..............grading info.............
router.get("/grading-scale",utils.extractStudentToken,gradingController.getAllGrading);
//..............holiday info.............
 router.get("/holiday",utils.extractStudentToken, holidayController.getAllHoliday);
//..............exam mark info.............
router.post("/exam-mark",utils.extractStudentToken, examMarkController.getLatestExamTypeAndClassRoomId,examMarkController.getPublishedExamMark);


module.exports = router;
