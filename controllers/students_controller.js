const express = require("express");
const configs = require("../config/config.json");
const constants = require("../utils/constants");
const statusCode = require("../utils/status_code");
const classRoomController = require("../controllers/class_room_controller");
const db = require("../config/mysqldb");
const bcrypt = require("bcryptjs");
const mulipartHandler = require("../middlewares/mulipart_handler");
const staticMessage = require("../utils/message");
const tName = constants.STUDENT_TABLE;
const tObj = "s";
exports.addStudent = (req, res, next) => {
  console.log(`......name............${req.body.user_id}`);
  const sql = `SELECT * FROM ${tName} WHERE user_id = ?`;

  db.query(sql, [req.body.user_id], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        err,
      });
    }
    if (rows.length > 0) {
      console.log(rows);
      console.log(`.................req.body.profile...........${req.body.profile}`);
      if (req.body.profile) {
        mulipartHandler.deletUloadedFile(req.body.profile, (message) => {
          console.log(`.................message...........${message}`);
          return res.status(statusCode.STATUS_CONFLICT).json({
            message: staticMessage.ALREADY_EXISTS(req.headers.language),
            data: rows[0]
          });
        });
      } else {
        return res.status(statusCode.STATUS_CONFLICT).json({
          message: staticMessage.ALREADY_EXISTS(req.headers.language),
          data: rows[0]
        });
      }
    } else {
      const hash = bcrypt.hashSync(req.body.password, 8);
      req.body.password = hash;
      req.body.promoted_class_room_id = null;
      db.query(
        `INSERT INTO ${tName} SET ?`,
        req.body,
        (err, result, fields) => {
          if (err instanceof Error) {
            console.log(err);
            return res.status(statusCode.STATUS_BAD_REQUEST).json({
              message: staticMessage.FAILED(req.headers.language),
              error: err,
            });
          } else {
            req.body.student_id = result.insertId;
            next();
            // updateStudentIdInClassRoom(
            //   "Added Successfully",
            //   result.insertId,
            //   req.body.class_room_id,
            //   res,
            //   result
            // );

            // res.status(statusCode.STATUS_CREATED).json({
            //   message: "Success",
            //   data: rows,
            // });
          }
        }
      );
    }
  });
};

exports.getAllStudents = (req, res) => {
  const sql = `SELECT 
  ${this.selectedStudentFields(tObj)},
  ${getRelationalQuery1} ORDER BY ${tObj}.roll_no ASC, ay.name DESC`;

  db.query(sql, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    console.log(`number of rows..............${rows.length}`);

    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: parseRelationalDataToJson(rows),
    });
  });
};

exports.countStudentsByGender = (req, res) => {
  const sql = `SELECT gender, COUNT(*) AS total FROM ${tName} GROUP BY gender`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res
        .status(statusCode.STATUS_BAD_REQUEST)
        .json({ error: "Database error" });
    }

    // Respond with the count of students grouped by gender
    res.json({ genderCounts: results });
  });
};
exports.getStudentById = (req, res) => {
  // Define fields that should be excluded based on the request (or user role, etc.)
  // const excludeFields = req.query.exclude
  //   ? req.query.exclude.split(",")
  //   : ["password", "division_id", "district_id", "upozila_id"];

  // // Filter out the fields that need to be excluded
  // const selectedFields = this.allTeacherField.filter(
  //   (field) => !excludeFields.includes(field)
  // );
  const sql = `SELECT 
   ${this.selectedStudentFields("s")},
   ${getRelationalQuery} WHERE s.id = ?`;

  db.query(sql, [req.params.id], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message:staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    if (rows.length > 0) {
      return res.status(statusCode.STATUS_OK).json({
        message: staticMessage.SUCCESS(req.headers.language),
        data: parseRelationalDataToJson(rows)[0],
      });
    } else {
      return res.status(statusCode.STATUS_NOT_FOUND).json({
        message:staticMessage.NOT_FOUND(req.headers.language),
      });
    }
  });
};
exports.getFileteredStudents = (req, res) => {
  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += "class_room_id = ?";
    queryList.push(req.query.class_room_id);
  }

  if (req.query.group_id != null) {
    conditions += `${conditions.length > 0 ? "AND" : ""} group_id = ?`;
    queryList.push(req.query.group_id);
  }

  if (req.query.academic_year_id != null) {
    conditions += `${conditions.length > 0 ? "AND" : ""} academic_year_id = ?`;
    queryList.push(req.query.academic_year_id);
  }
  console.log(
    `conditions .........${conditions}....queryList......${queryList}`
  );
  var sql;
  if (queryList.length > 0)
    sql = `SELECT id,first_name,last_name,class_room_id,roll_no FROM ${constants.STUDENT_TABLE} WHERE ${conditions} ORDER BY roll_no ASC`;
  else
    sql = `SELECT id,first_name,last_name,class_room_id,roll_no FROM ${constants.STUDENT_TABLE} ORDER BY roll_no ASC`;

  // const sql = `SELECT id,first_name,middle_name,last_name,class_id,group_id,reg_no from ${constants.STUDENT_TABLE}`;

  db.query(sql, queryList, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: rows,
    });
  });
};
exports.updateStudent = (req, res, next) => {
  var hash = null;
  if (req.body.password) {
    hash = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hash;
  }
  const id = req.params.id; // Get the user id from the URL
  const updateData = req.body; // Get the fields to update from the request body

  // Dynamically build the SQL SET clause and the values array for the query
  let setClause = [];
  let values = [];

  // Loop through the keys of the object and build the SET part of the query
  for (let key in updateData) {
    if (
      key === "password" ||
      key === "user_id" ||
      key === "class_student_id" ||
      key === "promoted_class_room_id" ||
      key === "class_room_id" ||
      key === "old_class_room_id"
    ) {
    } else {
      setClause.push(`${key} = ?`); // For each key in the object, add `key = ?`
      values.push(updateData[key]); // Push the value corresponding to the key
    }
  }
  // console.log(`.............setClause.......${setClause}..values....${values}`);
  // Add the user ID to the values array (for the WHERE clause)
  values.push(id);

  // Construct the final UPDATE query string
  const query = `UPDATE ${constants.STUDENT_TABLE} SET ${setClause.join(
    ", "
  )} WHERE id = ?`;

  // Execute the query
  db.query(query, values, (err, result) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res
        .status(statusCode.STATUS_NOT_FOUND)
        .json({ message: staticMessage.NOT_FOUND(req.headers.language) });
    } else {
      req.body.student_id = id;
      if (req.body.class_room_id != null) {
        next();
      } else {
        return res.status(statusCode.STATUS_OK).json({
          message: staticMessage.UPDATED_SUCCESSFULLY(req.headers.language),
          data: result.affectedRows,
        });
      }
    }
  });
};
//delete
exports.deleteStudent = (req, res, next) => {
  const id = req.params.id; // Get the ID from the request parameters
  // SQL query to delete the record from the database
  const sql = `DELETE FROM ${constants.STUDENT_TABLE} WHERE id = ?`;

  // Execute the SQL query
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting User:", err);
      return res
        .status(statusCode.STATUS_BAD_REQUEST)
        .json({ message: staticMessage.FAILED_TO_DELETE(req.headers.language), error: err });
    }

    if (result.affectedRows === 0) {
      return res
        .status(statusCode.STATUS_NOT_FOUND)
        .json({ message: staticMessage.NOT_FOUND(req.headers.language) });
    } else {
      next();
    }
  });
};

var parseRelationalDataToJson = (rows) => {
  // Format the results as JSON objects
  rows.forEach((element) => {
    //  delete element.password;
    //  delete element.department_id;
    element["class_room_info"] =
      element.class_room_info != null
        ? JSON.parse(element.class_room_info)
        : {};
    element["class_info"] = JSON.parse(element.class_info);
    element["group_info"] =
      element.group_info != null ? JSON.parse(element.group_info) : {};
    element["academic_year_info"] =
      element.academic_year_info != null
        ? JSON.parse(element.academic_year_info)
        : {};
    element["post_office_info"] = JSON.parse(element.post_office_info);
    element["upozila_info"] = JSON.parse(element.upozila_info);
    element["district_info"] = JSON.parse(element.district_info);
    element["division_info"] = JSON.parse(element.division_info);
  });
  return rows;
};

var getRelationalQuery1 = `
JSON_OBJECT('id', cr.id,'class_id', cr.class_id,'group_id', cr.group_id,'academic_year_id', cr.academic_year_id,
'class_name',c.name,'group_name',g.name,'academic_year_name',ay.name) AS class_room_info,
JSON_OBJECT('id', c.id,'name', c.name,'group_id', c.group_id) AS class_info,
JSON_OBJECT('id', g.id,'name', g.name) AS group_info,
JSON_OBJECT('id', ay.id,'name', ay.name) AS academic_year_info,
JSON_OBJECT('id', d.id,'name', d.name,'name_bn', d.bn_name) AS division_info,
JSON_OBJECT('id', dist.id,'name', dist.name,'division_id', dist.division_id,'name_bn', dist.bn_name) AS district_info,
JSON_OBJECT('id', u.id,'name', u.name,'district_id', u.district_id,'name_bn', u.bn_name) AS upozila_info,
JSON_OBJECT('id', p.id,'name', p.name,'upozila_id', p.upazilla_id,'name_bn', p.bn_name) AS post_office_info
FROM ${constants.STUDENT_TABLE} as ${tObj}
LEFT JOIN ${constants.CLASS_ROOM_TABLE_NAME} as cr ON ${tObj}.class_room_id = cr.id
LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON cr.class_id = c.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON cr.group_id = g.id
LEFT JOIN ${constants.ACADEMIC_YEAR_TABLE_NAME} as ay ON cr.academic_year_id = ay.id
LEFT JOIN ${constants.DIVISION_TABLE_NAME} as d ON ${tObj}.division_id = d.id
LEFT JOIN ${constants.DISTRICT_TABLE_NAME} as dist ON ${tObj}.district_id = dist.id
LEFT JOIN ${constants.UPAZILA_TABLE_NAME} as u ON ${tObj}.upozila_id = u.id
LEFT JOIN ${constants.UNION_TABLE_NAME} as p ON ${tObj}.post_office_id = p.id`;

var getRelationalQuery = `JSON_OBJECT('id', c.id,'name', c.name,'group_id', c.group_id) AS class_info,
JSON_OBJECT('id', g.id,'name', g.name) AS group_info,
JSON_OBJECT('id', ay.id,'name', ay.name) AS academic_year_info,
JSON_OBJECT('id', d.id,'name', d.name,'name_bn', d.bn_name) AS division_info,
JSON_OBJECT('id', dist.id,'name', dist.name,'division_id', dist.division_id,'name_bn', dist.bn_name) AS district_info,
JSON_OBJECT('id', u.id,'name', u.name,'district_id', u.district_id,'name_bn', u.bn_name) AS upozila_info,
JSON_OBJECT('id', p.id,'name', p.name,'upozila_id', p.upazilla_id,'name_bn', p.bn_name) AS post_office_info
FROM ${constants.STUDENT_TABLE} as ${tObj}
LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON ${tObj}.class_id = c.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON ${tObj}.group_id = g.id
LEFT JOIN ${constants.ACADEMIC_YEAR_TABLE_NAME} as ay ON ${tObj}.academic_year_id = ay.id
LEFT JOIN ${constants.DIVISION_TABLE_NAME} as d ON ${tObj}.division_id = d.id
LEFT JOIN ${constants.DISTRICT_TABLE_NAME} as dist ON ${tObj}.district_id = dist.id
LEFT JOIN ${constants.UPAZILA_TABLE_NAME} as u ON ${tObj}.upozila_id = u.id
LEFT JOIN ${constants.UNION_TABLE_NAME} as p ON ${tObj}.post_office_id = p.id

`;

exports.allStudentField = [
  "id",
  "first_name",
  "first_name_bn",
  "last_name",
  "last_name_bn",
  "user_type",
  "roll_no",
  "gender",
  "user_id",
  "password",
  "email",
  "phone",
  "profile",
  "father_name",
  "mother_name",
  // "class_id",
  // "group_id",
  // "academic_year_id",
  "class_room_id",
  "promoted_class_room_id",
  "nid",
  "dob",
  "area",
  "post_office_id",
  "upozila_id",
  "district_id",
  "division_id",
  "is_active",
  "created_at",
  "updated_at",
];

exports.selectedStudentFields = (obj) => {
  var excludedField = [
    "password",
    // "division_id",
    // "district_id",
    // "upozila_id",
    // "created_at",
    // "updated_at",
  ];
  var selectedField = [];
  this.allStudentField.forEach((element) => {
    if (!excludedField.includes(element))
      selectedField.push(`${obj}.${element}`);
  });
  return selectedField;
};
