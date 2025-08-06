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
const commentsController = require("../../controllers/comments_controller");


const homeWorkController = require("../../controllers/home_work_controller");

//login
router.post("/login", teacherAuthController.loginController);
router.post(
  "/change-password/",
  utils.extractTeacherToken,
  teacherAuthController.changePasswordController
);

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

// ..........comments...........
router.post("/comments",utils.extractTeacherToken, commentsController.addComment,commentsController.getAllComments);
router.get("/comments",utils.extractTeacherToken, commentsController.getAllComments);
router.delete("/comments/:id", utils.extractTeacherToken,commentsController.deleteComment);
router.put("/comments/:id", utils.extractTeacherToken,commentsController.updateComments,commentsController.getAllComments);

//..............teacher info...............
router.get(
  "/teacher-info/:id",
  utils.extractTeacherToken,
  teacherController.getTeacherById
);
router.put(
  "/teacher/:id",
  utils.extractTeacherToken,
  teacherController.updateTeachers
);
//class student...
router.get(
  "/student-global-search",
  utils.extractTeacherToken,
  clssStudentController.studentGolobalSearch
);

//..............attendance info.............
router.get(
  "/attendance-particular-month",
  utils.extractTeacherToken,
  attendenceController.getAttendanceForPerticularMonth
);
router.get(
  "/particular-date-attendance",
  utils.extractTeacherToken,
  attendenceController.getLatestAttendanceDate,
  attendenceController.getPreviousAttendanceDate,
  attendenceController.getNextAttendanceDate,
  attendenceController.getParticularDateAttendance
);

router.post(
  "/attendance",
  utils.extractTeacherToken,
  attendenceController.addAttendence
);
router.put(
  "/attendance/:id",
  utils.extractTeacherToken,
  attendenceController.updateAttendance
);
router.delete(
  "/attendance/:id",
  utils.extractTeacherToken,
  attendenceController.deleteAttendence
);

//..............holiday info.............
router.get(
  "/holiday-particular-month",
  utils.extractTeacherToken,
  holidayController.getParticularMonthHoliday
);
//..............subject info.............
router.get(
  "/subject-only-dropdown",
  utils.extractTeacherToken,
  subjectController.getAllSubjectsForDropdown
);
router.get(
  "/class-wise-subject",
  utils.extractTeacherToken,
  classRoutineController.getAllSubjectsAccordingToClassroom
);

router.get(
  "/class-wise-teacher",
  utils.extractTeacherToken,
  classRoutineController.getAllTeachersAccordingToClassroom
);
//..............time slot info.............
router.get(
  "/time-slot-only-dropdown",
  utils.extractTeacherToken,
  timeSlotController.getAllTimeSlotOnlyDropdown
);
//..............teacher info.............
router.get(
  "/teacher-only-dropdown",
  utils.extractTeacherToken,
  teacherController.getAllTeachersForDropdown
);

//..............home work info.............
router.get(
  "/particular-date-homework",
  utils.extractTeacherToken,
  homeWorkController.getLatestHomeWorkDate,
  homeWorkController.getPreviousHomeWorkDate,
  homeWorkController.getNextHomeWorkDate,
  homeWorkController.getParticularDateHomeWork
);
router.post(
  "/home-work",
  utils.extractTeacherToken,
  homeWorkController.addHomeWork
);
router.get(
  "/home-work/:id",
  utils.extractTeacherToken,
  homeWorkController.getHomeWorkBuId
);
router.put(
  "/home-work/:id",
  utils.extractTeacherToken,
  homeWorkController.updateHomeWork
);
router.delete(
  "/home-work/:id",
  utils.extractTeacherToken,
  homeWorkController.deleteHomeWork
);

//..............class routine info.............
router.get(
  "/my-class-routine",
  utils.extractTeacherToken,
  classRoutineController.getLatestAcademicYear,
  classRoutineController.getMyClassRoutineByAcademicYearId
);
//..............exam routine info.............
router.get(
  "/exam_routine",
  utils.extractTeacherToken,
  examRoutineController.getExamRoutineByClassRoomId
);
router.get(
  "/exam-type-only-dropdown",
  examTypeController.getAllExamTypeForDropdown
);

//..............class fees info.............
router.get(
  "/fee-type-only-dropdown",
  feeTypeController.getAllFeeTypesForDropdown
);
router.get(
  "/class-fees",
  utils.extractTeacherToken,
  classFeesController.getClassFeesByClassRoomId
);
router.get(
  "/fee-collection",
  utils.extractTeacherToken,
  feeCollectionController.getAllCollectionForSingleStudent
);
//..............notice info.............
router.get(
  "/notice",
  utils.extractTeacherToken,
  noticeController.getLatestAcademicYear,
  noticeController.getAllNotice
);
//..............grading info.............
router.get(
  "/grading-scale",
  utils.extractTeacherToken,
  gradingController.getAllGrading
);
//..............holiday info.............
router.get(
  "/holiday",
  utils.extractTeacherToken,
  holidayController.getLatestAcademicYear,
  holidayController.getAllHoliday
);
//..............exam mark info.............
router.get(
  "/exam-mark",
  utils.extractTeacherToken,
  examMarkController.getExamMarkWithStudentDetails
);
router.post(
  "/exam-mark",
  utils.extractTeacherToken,
  examMarkController.addExamMark
);
router.put(
  "/publish-mark/:id",
  utils.extractTeacherToken,
  examMarkController.publishMark
);

router.put(
  "/exam-mark/:id",
  utils.extractTeacherToken,
  examMarkController.updateExamMark
);

// router.delete("/exam-mark/:id",  utils.extractTeacherToken, examMarkController.deleteExamMark);

module.exports = router;
