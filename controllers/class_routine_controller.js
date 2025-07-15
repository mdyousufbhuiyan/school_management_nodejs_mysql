const express = require("express");
const configs = require("../config/config.json");
const constants = require("../utils/constants");
const statusCode = require("../utils/status_code");
const db = require("../config/mysqldb");
const staticMessage = require("../utils/message");
const notificationController = require("../utils/notification_controller");

const tName = constants.CLASS_ROUTINE_TABLE_NAME;
const tObj = "cRoutine";
exports.addClassRoutine = (req, res) => {
  checkUniqueValue(req.body);
  const sql = `SELECT * FROM ${tName} WHERE class_room_id = ?`;
  db.query(
    sql,
    [req.body.class_room_id],
    (err, rows, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: staticMessage.FAILED(req.headers.language),
          err,
        });
      }
      if (rows.length > 0) {
        console.log(rows);
        return res.status(statusCode.STATUS_CONFLICT).json({
          message: staticMessage.ALREADY_EXISTS(req.headers.language),
        });
      } else {
        db.query(
          `INSERT INTO ${tName} SET ?`,
          req.body,
          async(err, rows, fields) => {
            if (err instanceof Error) {
              console.log(err);
              return res.status(statusCode.STATUS_BAD_REQUEST).json({
                message: staticMessage.FAILED(req.headers.language),
                error: err,
              });
            } else if (rows) {
                   await notificationController.sendNotificationToClassRoomIdsTopics(
                          [req.body.class_room_id],
                          staticMessage.CLASS_ROUTINE(req.headers.language),
                          staticMessage.NEW_CLASS_ROUTINE_UPLOADED(req.headers.language)
                        );
              res.status(statusCode.STATUS_CREATED).json({
                message: staticMessage.SUCCESS(req.headers.language),
                data: rows,
              });
            } else {
              console.log(rows);
              return res.status(statusCode.STATUS_BAD_REQUEST).json({
                message: staticMessage.FAILED(req.headers.language),
                data: rows,
              });
            }
          }
        );
      }
    }
  );
};

exports.getAllClassRoutine = (req, res) => {
  var conditions = "";
  var queryList = [];
  if (req.query.class_id != null) {
    conditions += `cr.class_id = ?`;
    queryList.push(req.query.class_id);
  }
  if (req.query.group_id != null) {
    conditions += `${conditions.length > 0 ? "AND" : ""} cr.group_id = ?`;
    queryList.push(req.query.group_id);
  }

  if (req.query.academic_year_id != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } cr.academic_year_id = ?`;
    queryList.push(req.query.academic_year_id);
  }
   if(queryList.length>0){
    const sql = `SELECT 
    ${this.selectedFields(tObj)},
    ${getRelationalQuery(req.headers.language)} WHERE ${conditions} ORDER By a.name DESC`;
  
    db.query(sql,queryList, (err, rows, fields) => {
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
   }else{
    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: [],
    });
   }
};
exports.getAllClassRoutineByClassRoomId = (req, res) => {
  const sql = `SELECT 
    ${this.selectedFields(tObj)},
    ${getRelationalQuery(req.headers.language)} WHERE class_room_id = ? ORDER By a.name DESC`;
  
    db.query(sql,[req.query.class_room_id], (err, rows, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: staticMessage.FAILED(req.headers.language),
          error: err,
        });
      }
      return res.status(statusCode.STATUS_OK).json({
        message: staticMessage.SUCCESS(req.headers.language),
        data: rows.length>0? parseRelationalDataToJson(rows)[0]:[],
      });
    });
};
exports.getAllClassRoutineById = (req, res) => {
  const sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery(req.headers.language)} WHERE ${tObj}.id = ?`;

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

exports.updateClassRoutine = (req, res) => {
  var subjectList = JSON.parse(req.body["subject_ids"]);
  var teacherList = JSON.parse(req.body["teacher_ids"]);
  var roomNumberList = JSON.parse(req.body["room_numbers"]);
  var timeSlotList = JSON.parse(req.body["time_slot_ids"]);
  const values = [
    subjectList.length,
    teacherList.length,
    roomNumberList.length,
    timeSlotList.length,
  ];

  const areEqual = values.every((val) => val === values[0]);

  console.log(areEqual);
  if (!areEqual) {
    return res.status(statusCode.STATUS_BAD_REQUEST).json({
      message: "Request data is not well formated",
    });
  }

  // Construct the final UPDATE query string
  const sql = `SELECT * FROM ${tName} WHERE id != ? AND class_room_id = ?`;

  db.query(
    sql,
    [req.params.id,req.body.class_room_id],
    (err, rows, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: staticMessage.FAILED(req.headers.language),
          err,
        });
      }

      if (rows.length > 0) {
        console.log(rows);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: staticMessage.ALREADY_EXISTS(req.headers.language),
        });
      } else {
        const id = req.params.id; // Get the user id from the URL
        const updateData = req.body; // Get the fields to update from the request body

        // Dynamically build the SQL SET clause and the values array for the query
        let setClause = [];
        let values = [];

        // Loop through the keys of the object and build the SET part of the query
        for (let key in updateData) {
          if (key === "updated_at" || key === "created_at" || key === "db_name") {
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
        db.query(
          query, values,
           async (err, result) => {
            if (err) {
              return res.status(statusCode.STATUS_BAD_REQUEST).json({ error: err.message });
            }

            // Check if any row was updated
            if (result.affectedRows === 0) {
              return res.status(statusCode.STATUS_BAD_REQUEST).json({ message: staticMessage.NOT_FOUND(req.headers.language) });
            }
            await notificationController.sendNotificationToClassRoomIdsTopics(
              [req.body.class_room_id],
              staticMessage.CLASS_ROUTINE(req.headers.language),
              staticMessage.NEW_CLASS_ROUTINE_UPLOADED(req.headers.language)
            );
            // Return a success response
            res.status(statusCode.STATUS_OK).json({
              message: staticMessage.SUCCESS(req.headers.language),
              data: result.affectedRows,
            });
          }
        );
      }
    }
  );
};

//delete
exports.deleteClassRoutine = (req, res) => {
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
        .json({ message: staticMessage.STATUS_NOT_FOUND(req.headers.language) });
    }

    // If the record is deleted successfully
    return res
      .status(statusCode.STATUS_OK)
      .json({ message: staticMessage.DELETED_SUCCESSFULLY(req.headers.language) });
  });
};

function checkUniqueValue(data){
  var subjectList = JSON.parse(data["subject_ids"]);
  var teacherList = JSON.parse(data["teacher_ids"]);
  var roomNumberList = JSON.parse(data["room_numbers"]);
  var timeSlotList = JSON.parse(data["time_slot_ids"]);
  console.log(
    `..........timeSlotList.....${timeSlotList}..timeSlotList..length...${timeSlotList.length}`
  );
  console.log(
    `..........teacherList.....${teacherList}..teacherList..length...${teacherList.length}`
  );
  console.log(
    `..........subjectList.....${subjectList}..subjectList..length...${subjectList.length}`
  );
  console.log(
    `..........roomNumberList.....${roomNumberList}..roomNumberList..length...${roomNumberList.length}`
  );
  
  const values = [
    subjectList.length,
    teacherList.length,
    roomNumberList.length,
    timeSlotList.length,
  ];

  const areEqual = values.every((val) => val === values[0]);

  console.log(areEqual);
  if (!areEqual) {
    return res.status(statusCode.STATUS_BAD_REQUEST).json({
      message: "Request data is not well formated",
    });
  }
}


var parseRelationalDataToJson = (rows) => {
  // Format the results as JSON objects
  rows.forEach((element) => {
    //  delete element.password;
    //  delete element.department_id;
    // element["academic_year_id"] = JSON.parse(element.academic_year_id);
    // element["subject_ids"] = JSON.parse(element.subject_ids);
    // element["teacher_ids"] = JSON.parse(element.teacher_ids);
    // element["time_slot_ids"] = JSON.parse(element.time_slot_ids);
    element["class_info"] = JSON.parse(element.class_info);
    element["group_info"] =element.group_info!=null? JSON.parse(element.group_info):{};
    element["academic_year_info"] = JSON.parse(element.academic_year_info);
  });
  return rows;
};
var getRelationalQuery =(language)=>{ 
  return `
JSON_OBJECT('id', c.id,'name',  ${language==constants.LANGUAGE_BN?'c.name_bn':'c.name'}) AS class_info,
JSON_OBJECT('id', g.id,'name', ${language==constants.LANGUAGE_BN?'g.name_bn':'g.name'}) AS group_info,
JSON_OBJECT('id', a.id,'name', ${language==constants.LANGUAGE_BN?'a.name_bn':'a.name'}) AS academic_year_info
FROM ${tName} as ${tObj}
LEFT JOIN ${constants.CLASS_ROOM_TABLE_NAME} as cr ON ${tObj}.class_room_id = cr.id
LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON cr.class_id = c.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON cr.group_id = g.id
LEFT JOIN ${constants.ACADEMIC_YEAR_TABLE_NAME} as a ON cr.academic_year_id = a.id`;
}
exports.allFields = [
  "id",
  "class_room_id",
  "subject_ids",
  "teacher_ids",
  "room_numbers",
  "time_slot_ids",
  "created_at",
  "updated_at",
];

exports.selectedFields = (obj) => {
  var excludedField = [
    //  "password",
    // "division_id",
    // "district_id",
    // "upozila_id",
    // "created_at",
    // "updated_at",
  ];
  var selectedField = [];
  this.allFields.forEach((element) => {
    if (!excludedField.includes(element))
      selectedField.push(`${obj}.${element}`);
  });
  return selectedField;
};
