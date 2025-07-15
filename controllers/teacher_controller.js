const express = require("express");
const configs = require("../config/config.json");
const constants = require("../utils/constants");
const statusCode = require("../utils/status_code");
const db = require("../config/mysqldb");
const bcrypt = require("bcryptjs");
const mulipartHandler = require("../middlewares/mulipart_handler");
const staticMessage = require("../utils/message");
const tName = constants.TEACHER_TABLE;
exports.addTeacher = (req, res) => {
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
      db.query(
        `INSERT INTO ${tName} SET ?`,
        req.body,
        (err, rows, fields) => {
          if (err instanceof Error) {
            console.log(err);
            return res.status(statusCode.STATUS_BAD_REQUEST).json({
              message: staticMessage.FAILED(req.headers.language),
              error: err,
            });
          } else {
            res.status(statusCode.STATUS_CREATED).json({
              message: staticMessage.SUCCESS(req.headers.language),
              data: rows,
            });
          }
        }
      );
    }
  });
};

exports.getAllTeachersForDropdown = (req, res) => {
  const sql = `SELECT id, ${req.headers.language==constants.LANGUAGE_BN?'first_name_bn':'first_name'} as first_name, ${req.headers.language==constants.LANGUAGE_BN?'middle_name_bn':'middle_name'} as middle_name,${req.headers.language==constants.LANGUAGE_BN?'last_name_bn':'last_name'} as last_name FROM ${tName}`;

  db.query(sql, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: rows,
    });
  });

  // teacherSchema(req.headers.db_name)
  //   .find()
  //   .select({ first_name: 1, middle_name: 1, last_name: 1, _id: 1 })
  //   .then((result) => {
  //     return res.status(201).json({
  //       data: result,
  //     });
  //   }).catch((err) => {
  //     console.log(err.message);
  //     return res.status(401).json({
  //       message: "Failed ",
  //       err,
  //     });
  //   });
};

exports.getAllTeachers = (req, res) => {
  // Define fields that should be excluded based on the request (or user role, etc.)
  // const excludeFields = req.query.exclude
  //   ? req.query.exclude.split(",")
  //   : ["password", "division_id", "district_id", "upozila_id"];

  // // Filter out the fields that need to be excluded
  // const selectedFields = this.allTeacherField.filter(
  //   (field) => !excludeFields.includes(field)
  // );
  const sql = `SELECT 
  ${this.selectedTeacherFields('t')},
  ${getRelationalQuery}`;

  db.query(sql, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: parseRelationalDataToJson(rows),
    });
  });
};
exports.countTeachersByGender = (req, res) => {
  const sql = `SELECT gender, COUNT(*) AS total FROM ${tName} GROUP BY gender`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({ error: 'Database error' });
    }

    // Respond with the count of students grouped by gender
    res.json({ genderCounts: results });
  });
};
exports.getTeacherById = (req, res) => {
  // Define fields that should be excluded based on the request (or user role, etc.)
  // const excludeFields = req.query.exclude
  //   ? req.query.exclude.split(",")
  //   : ["password", "division_id", "district_id", "upozila_id"];

  // // Filter out the fields that need to be excluded
  // const selectedFields = this.allTeacherField.filter(
  //   (field) => !excludeFields.includes(field)
  // );
  const sql = `SELECT 
   ${this.selectedTeacherFields('t')},
   ${getRelationalQuery} WHERE t.id = ?`;

  db.query(sql, [req.params.id], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
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
        message: staticMessage.NOT_FOUND(req.headers.language),
      });
    }
  });
};


exports.updateTeachers = (req, res) => {
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
    if (key === "password" || key === "user_id" || key === "db_name") {
    } else {
      setClause.push(`${key} = ?`); // For each key in the object, add `key = ?`
      values.push(updateData[key]); // Push the value corresponding to the key
    }
  }
  // console.log(`.............setClause.......${setClause}..values....${values}`);
  // Add the user ID to the values array (for the WHERE clause)
  values.push(id);

  // Construct the final UPDATE query string
  const query = `UPDATE ${tName} SET ${setClause.join(
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
    }

    // Return a success response
    res.status(statusCode.STATUS_OK).json({
      message: staticMessage.UPDATED_SUCCESSFULLY(req.headers.language),
      data: result.affectedRows,
    });
  });
};

//delete
exports.deleteTeachers = (req, res) => {
  const id = req.params.id; // Get the ID from the request parameters

  // SQL query to delete the record from the database
  const sql = `DELETE FROM ${tName} WHERE id = ?`;

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
    }

    // If the record is deleted successfully
    return res
      .status(statusCode.STATUS_OK)
      .json({ message: staticMessage.DELETED_SUCCESSFULLY(req.headers.language) });
  });
};

var parseRelationalDataToJson = (rows) => {
  // Format the results as JSON objects
  rows.forEach((element) => {
    //  delete element.password;
    //  delete element.department_id;
    element["post_office_info"] = JSON.parse(element.post_office_info);
    element["upozila_info"] = JSON.parse(element.upozila_info);
    element["district_info"] = JSON.parse(element.district_info);
    element["division_info"] = JSON.parse(element.division_info);
  });
  return rows;
};
var getRelationalQuery = `JSON_OBJECT('id', d.id,'name', d.name,'name_bn', d.bn_name) AS division_info,
JSON_OBJECT('id', dist.id,'name', dist.name,'division_id', dist.division_id,'name_bn', dist.bn_name) AS district_info,
JSON_OBJECT('id', u.id,'name', u.name,'district_id', u.district_id,'name_bn', u.bn_name) AS upozila_info,
JSON_OBJECT('id', p.id,'name', p.name,'upozila_id', p.upazilla_id,'name_bn', p.bn_name) AS post_office_info
FROM ${constants.TEACHER_TABLE} as t
LEFT JOIN ${constants.DIVISION_TABLE_NAME} as d ON t.division_id = d.id
LEFT JOIN ${constants.DISTRICT_TABLE_NAME} as dist ON t.district_id = dist.id
LEFT JOIN ${constants.UPAZILA_TABLE_NAME} as u ON t.upozila_id = u.id
LEFT JOIN ${constants.UNION_TABLE_NAME} as p ON t.post_office_id = p.id`;
exports.allTeacherField = [
  "id",
  "first_name",
  "first_name_bn",
  "middle_name",
  "middle_name_bn",
  "last_name",
  "last_name_bn",
  "user_type",
  "reg_no",
  "gender",
  "user_id",
  "password",
  "email",
  "phone",
  "profile",
  "father_name",
  "mother_name",
  "designation",
  "designation_bn",
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
exports.selectedTeacherFields = (obj) => {
  var excludedField = [
    "password",
    // "division_id",
    // "district_id",
    // "upozila_id",
    // "created_at",
    // "updated_at",
  ];
  var selectedField = [];
  this.allTeacherField.forEach((element) => {
    if (!excludedField.includes(element)) selectedField.push(`${obj}.${element}`);
  });
  return selectedField;
};
