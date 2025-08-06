const express = require("express");
const configs = require("../config/config.json");
const constants = require("../utils/constants");

const db = require("../config/mysqldb");
const statusCode = require("../utils/status_code");
const staticMessage = require("../utils/message");
const notificationController = require("../utils/notification_controller");
var tName = constants.EXAM_MARKS_TABLE_NAME;
var tObj = "em";
var ayObj = "academicYear";

exports.addExamMark = (req, res) => {
  const sql = `SELECT * FROM ${tName} WHERE class_room_id = ? AND subject_id = ? AND exam_type_id = ?`;
  db.query(
    sql,
    [req.body.class_room_id, req.body.subject_id, req.body.exam_type_id],
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
          async (err, rows, fields) => {
            if (err instanceof Error) {
              console.log(err);
              return res.status(statusCode.STATUS_BAD_REQUEST).json({
                message: staticMessage.FAILED(req.headers.language),
                error: err,
              });
            } else {
              // var stIds =JSON.parse(req.body.student_ids);
              // await notificationController.sendNotificationToClassRoomIdsTopics(
              //   [req.body.class_room_id],
              //   staticMessage.EXAM_MARK(req.headers.language),
              //   staticMessage.NEW_EXAM_MARK_UPLOADED(req.headers.language)
              // );
              res.status(statusCode.STATUS_CREATED).json({
                message: staticMessage.SUCCESS(req.headers.language),
                data: rows,
              });
            }
          }
        );
      }
    }
  );
};
exports.getAllExamMark = (req, res) => {
  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }

  if (req.query.subject_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND" : ""
    } ${tObj}.subject_id = ?`;
    queryList.push(req.query.subject_id);
  }
  if (req.query.exam_type_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND" : ""
    } ${tObj}.exam_type_id = ?`;
    queryList.push(req.query.exam_type_id);
  }

  if (req.query.teacher_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND" : ""
    } ${tObj}.teacher_id = ?`;
    queryList.push(req.query.teacher_id);
  }
  if (queryList.length > 0) {
    const sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery(
    req.headers.language
  )} WHERE ${conditions} ORDER BY ${ayObj}.name DESC`;

    db.query(sql, queryList, (err, rows, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: staticMessage.FAILED(req.headers.language),
          error: err,
        });
      }
      //  console.log(rows);
      return res.status(statusCode.STATUS_OK).json({
        message: staticMessage.SUCCESS(req.headers.language),
        data: parseRelationalDataToJson(rows),
      });
    });
  } else {
    // console.log(rows);
    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: [],
    });
  }
};

exports.getPublishedExamMark = (req, res) => {
  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }

  if (req.query.subject_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND" : ""
    } ${tObj}.subject_id = ?`;
    queryList.push(req.query.subject_id);
  }
  if (req.query.exam_type_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND" : ""
    } ${tObj}.exam_type_id = ?`;
    queryList.push(req.query.exam_type_id);
  }

  if (req.query.teacher_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND" : ""
    } ${tObj}.teacher_id = ?`;
    queryList.push(req.query.teacher_id);
  }
  conditions += `${
    conditions.length > 0 ? " AND" : ""
  } ${tObj}.is_published = ?`;
  queryList.push(1);

  // if (req.query.from_date != null && req.query.to_date != null) {
  //   conditions += `${
  //     conditions.length > 0 ? "AND" : ""
  //   } ${tObj}.attendance_date BETWEEN ? AND ?`;
  //   queryList.push(req.query.from_date);
  //   queryList.push(req.query.to_date);
  // }
  console.log(`.......my.conditions........${conditions}.....${queryList}`);
  var sql;

  sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery(
    req.headers.language
  )} WHERE ${conditions} ORDER BY ${ayObj}.name DESC`;

  db.query(sql, queryList, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    //  console.log(rows);
    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: parseRelationalDataToJson(rows),
    });
  });
};
exports.getExamMarkWithStudentDetails = (req, res) => {
  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND" : ""
    } ${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }

  if (req.query.subject_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND" : ""
    } ${tObj}.subject_id = ?`;
    queryList.push(req.query.subject_id);
  }
  console.log(`.......my.conditions.list.......${conditions}.....`);

  if (req.query.exam_type_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND" : ""
    } ${tObj}.exam_type_id = ?`;
    queryList.push(req.query.exam_type_id);
  }
  // console.log(conditions);

  // if (req.query.teacher_id != null) {
  //   conditions += `${
  //     conditions.length > 0 ? " AND" : ""
  //   } ${tObj}.teacher_id = ?`;
  //   queryList.push(req.query.teacher_id);
  // }
  // conditions += `${
  //   conditions.length > 0 ? " AND" : ""
  // } ${tObj}.is_published = ?`;
  // queryList.push(1);

  // if (req.query.from_date != null && req.query.to_date != null) {
  //   conditions += `${
  //     conditions.length > 0 ? "AND" : ""
  //   } ${tObj}.attendance_date BETWEEN ? AND ?`;
  //   queryList.push(req.query.from_date);
  //   queryList.push(req.query.to_date);
  // }
  console.log(`.......my.conditions.list.......${conditions}.....${queryList}`);
  var sql;
  sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQueryWithStudentDetails(
    req.headers.language
  )} WHERE ${conditions} GROUP BY ${tObj}.id LIMIT 1`;
  //  ORDER BY st.roll_no ASC
  db.query(sql, queryList, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
      var resultObj = parseRelationalDataToJson(rows);
      return res.status(statusCode.STATUS_OK).json({
        message: staticMessage.SUCCESS(req.headers.language),
        data: resultObj.length > 0 ? resultObj[0] : {},
      });
  });
};
exports.getFilteredExamMark = (req, res) => {
  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }

  if (req.query.subject_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND" : ""
    } ${tObj}.subject_id = ?`;
    queryList.push(req.query.subject_id);
  }
  if (req.query.exam_type_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND" : ""
    } ${tObj}.exam_type_id = ?`;
    queryList.push(req.query.exam_type_id);
  }

  if (req.query.teacher_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND" : ""
    } ${tObj}.teacher_id = ?`;
    queryList.push(req.query.teacher_id);
  }
  // if (req.query.from_date != null && req.query.to_date != null) {
  //   conditions += `${
  //     conditions.length > 0 ? "AND" : ""
  //   } ${tObj}.attendance_date BETWEEN ? AND ?`;
  //   queryList.push(req.query.from_date);
  //   queryList.push(req.query.to_date);
  // }
  console.log(`.......my.conditions........${conditions}.....${queryList}`);
  var sql;

  if (queryList.length > 0)
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery(
    req.headers.language
  )} WHERE ${conditions} ORDER BY ${ayObj}.name DESC`;
  else
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery(req.headers.language)} ORDER BY ${ayObj}.name DESC`;

  db.query(sql, queryList, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    //  console.log(rows);
    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: parseRelationalDataToJson(rows),
    });
  });
};
exports.getLatestExamTypeAndClassRoomId = (req, res, next) => {
  //var exam_type_id = req.query.exam_type_id;
  const { class_room_ids, exam_type_id } = req.body; // Expecting an array of IDs in the body

  if (!Array.isArray(class_room_ids) || class_room_ids.length === 0) {
    return res
      .status(400)
      .json({ error: "Please provide an array of class_room_ids." });
  } else if (
    Array.isArray(class_room_ids) &&
    class_room_ids.length > 0 &&
    exam_type_id != null &&
    exam_type_id != "null" &&
    exam_type_id != ""
  ) {
    req.query.class_room_id = class_room_ids[0];
    req.query.exam_type_id = exam_type_id;
    next();
  } else {
    //console.log(`.......home_work_date............${req.query.home_work_date}`);
    // Step 1: Get the latest date from the most recent record
    const placeholders = class_room_ids.map(() => "?").join(", ");
    // console.log(`.......placeholders............${class_room_ids}`);
    const params = [...class_room_ids, 1];
    db.query(
      `SELECT class_room_id,exam_type_id FROM ${tName} WHERE class_room_id IN (${placeholders}) AND is_published = ? ORDER BY exam_date DESC LIMIT 1`,
      params,
      (err, result) => {
        if (err) {
          return res.status(500).send("Database error");
        }
        if (result.length > 0) {
          const class_room_id = result[0].class_room_id;
          const exam_type_id = result[0].exam_type_id;
          req.query.class_room_id = class_room_id;
          req.query.exam_type_id = exam_type_id;
          next();
        } else {
          return res.status(statusCode.STATUS_OK).json({
            message: staticMessage.SUCCESS(req.headers.language),
            data: result,
          });
        }
      }
    );
  }
  // if (req.query.class_room_id == null) {
  //   return res.status(statusCode.STATUS_BAD_REQUEST).json({
  //     message: staticMessage.FAILED(req.headers.language),
  //     data: [],
  //   });
  // }
};
exports.getStudentExamMarkGroupByExamType = (req, res) => {
  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }

  if (req.query.subject_id != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.subject_id = ?`;
    queryList.push(req.query.subject_id);
  }
  if (
    req.query.exam_type_id != null &&
    req.query.exam_type_id != "null" &&
    req.query.exam_type_id != ""
  ) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.exam_type_id = ?`;
    queryList.push(req.query.exam_type_id);
  }

  if (req.query.teacher_id != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.teacher_id = ?`;
    queryList.push(req.query.teacher_id);
  }
  // if (req.query.from_date != null && req.query.to_date != null) {
  //   conditions += `${
  //     conditions.length > 0 ? "AND" : ""
  //   } ${tObj}.attendance_date BETWEEN ? AND ?`;
  //   queryList.push(req.query.from_date);
  //   queryList.push(req.query.to_date);
  // }
  console.log(`........conditions........${conditions}.....${queryList}`);
  var sql;

  if (conditions.length) {
    var language = req.headers.language;
    sql = `SELECT ${tObj}.exam_type_id, ${tObj}.class_room_id,  
  JSON_ARRAYAGG(
      JSON_OBJECT(
          'id',${tObj}.id,
           'exam_type_id',${tObj}.exam_type_id,
          'class_room_id',${tObj}.class_room_id,
          'subject_id',${tObj}.subject_id,
           'total_mark',${tObj}.total_mark,
          'teacher_id',${tObj}.teacher_id,
           'exam_date',${tObj}.exam_date,
           'exam_marks',${tObj}.exam_marks,
           'student_ids',${tObj}.student_ids,
'class_info',JSON_OBJECT('id', c.id,'name',  ${
      language == constants.LANGUAGE_BN ? "c.name_bn" : "c.name"
    }),
'group_info',JSON_OBJECT('id', g.id,'name', ${
      language == constants.LANGUAGE_BN ? "g.name_bn" : "g.name"
    }),
'academic_year_info',JSON_OBJECT('id', academicYear.id,'name', ${
      language == constants.LANGUAGE_BN
        ? "academicYear.name_bn"
        : "academicYear.name"
    }),
'subject_info',JSON_OBJECT('id', s.id,'name',${
      language == constants.LANGUAGE_BN ? "s.name_bn" : "s.name"
    },'subject_code',s.subject_code),
'teacher_info',JSON_OBJECT('id', t.id,'first_name', ${
      language == constants.LANGUAGE_BN ? "t.first_name_bn" : "t.first_name"
    },'middle_name',${
      language == constants.LANGUAGE_BN ? "t.middle_name_bn" : "t.middle_name"
    },'last_name', ${
      language == constants.LANGUAGE_BN ? "t.last_name_bn" : "t.last_name"
    }),
'exam_type_info',JSON_OBJECT('id', e.id,'name', ${
      language == constants.LANGUAGE_BN ? "e.name_bn" : "e.name"
    })

  )
  ) AS exam_type_info FROM ${constants.EXAM_MARKS_TABLE_NAME} as ${tObj}
LEFT JOIN ${
      constants.CLASS_ROOM_TABLE_NAME
    } as cr ON ${tObj}.class_room_id = cr.id
LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON cr.class_id = c.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON cr.group_id = g.id
LEFT JOIN ${constants.SUBJECT_NAME_TABLE} as s ON ${tObj}.subject_id = s.id
LEFT JOIN ${constants.TEACHER_TABLE} as t ON ${tObj}.teacher_id = t.id
LEFT JOIN ${
      constants.ACADEMIC_YEAR_TABLE_NAME
    } as ${ayObj} ON cr.academic_year_id = ${ayObj}.id
LEFT JOIN ${constants.EXAM_TYPE_TABLE_NAME} as e ON ${tObj}.exam_type_id = e.id
  WHERE ${conditions} GROUP BY ${tObj}.exam_type_id`;
    // ORDER BY ${ayObj}.name DESC
    db.query(sql, queryList, (err, rows, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: staticMessage.FAILED(req.headers.language),
          error: err,
        });
      }
      //  console.log(rows);
      return res.status(statusCode.STATUS_OK).json({
        message: staticMessage.SUCCESS(req.headers.language),
        data: parseRelationalDataToJson(rows),
      });
    });
  } else {
    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: [],
    });
  }
};

exports.publishMark = (req, res) => {
  console.log(`.............publishResult.......${req.body}`);
  // Construct the final UPDATE query string
  const query = `UPDATE ${tName} SET is_published = ? WHERE id = ?`;
  // Execute the query
  db.query(
    query,
    [req.body.is_published, req.params.id],
    async (err, result) => {
      if (err) {
        return res
          .status(statusCode.STATUS_BAD_REQUEST)
          .json({ error: err.message });
      }

      // Check if any row was updated
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: staticMessage.NOT_FOUND(req.headers.language) });
      }
      // var stIds =JSON.parse(req.body.student_ids);
      // console.log(`........stIds.........>${stIds}....req.body.student_ids...${req.body.student_ids}`);

      await notificationController.sendNotificationToClassRoomIdsTopics(
        [req.body.class_room_id],
        staticMessage.EXAM_MARK(req.headers.language),
        staticMessage.NEW_EXAM_MARK_UPLOADED(req.headers.language)
      );
      // Return a success response
      res.status(statusCode.STATUS_OK).json({
        message: staticMessage.UPDATED_SUCCESSFULLY(req.headers.language),
        data: result.affectedRows,
      });
    }
  );
};
exports.updateExamMark = (req, res) => {
  console.log(`.............update.......${req.body}`);
  // Construct the final UPDATE query string
  const sql = `SELECT * FROM ${tName} WHERE id != ? AND class_room_id = ? AND subject_id = ? AND exam_type_id = ?`;

  db.query(
    sql,
    [
      req.params.id,
      req.body.class_room_id,
      req.body.subject_id,
      req.body.exam_type_id,
    ],
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
          if (
            key === "updated_at" ||
            key === "created_at"
            // ||
            // key === "academic_year_id" ||
            // key === "attendance_date"
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
        const query = `UPDATE ${tName} SET ${setClause.join(
          ", "
        )} WHERE id = ?`;
        // Execute the query
        db.query(query, values, async (err, result) => {
          if (err) {
            return res
              .status(statusCode.STATUS_BAD_REQUEST)
              .json({ error: err.message });
          }

          // Check if any row was updated
          if (result.affectedRows === 0) {
            return res
              .status(404)
              .json({ message: staticMessage.NOT_FOUND(req.headers.language) });
          }
          // var stIds =JSON.parse(req.body.student_ids);
          // console.log(`........stIds.........>${stIds}....req.body.student_ids...${req.body.student_ids}`);

          //  await notificationController.sendNotificationToClassRoomIdsTopics(
          //       [req.body.class_room_id],
          //       staticMessage.EXAM_MARK(req.headers.language),
          //       staticMessage.NEW_EXAM_MARK_UPLOADED(req.headers.language)
          //     );
          // Return a success response
          res.status(statusCode.STATUS_OK).json({
            message: staticMessage.UPDATED_SUCCESSFULLY(req.headers.language),
            data: result.affectedRows,
          });
        });
      }
    }
  );
};

//delete
exports.deleteExamMark = (req, res) => {
  const id = req.params.id; // Get the ID from the request parameters

  // SQL query to delete the record from the database
  const sql = `DELETE FROM ${tName} WHERE id = ?`;

  // Execute the SQL query
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting User:", err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED_TO_DELETE(req.headers.language),
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res
        .status(statusCode.STATUS_NOT_FOUND)
        .json({ message: staticMessage.NOT_FOUND(req.headers.language) });
    }

    // If the record is deleted successfully
    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.DELETED_SUCCESSFULLY(req.headers.language),
    });
  });
};

var parseRelationalDataToJson = (rows) => {
  // Format the results as JSON objects
  rows.forEach((element) => {
    //  delete element.password;
    //  delete element.department_id;

    element.student_info != null
      ? (element["student_info"] = JSON.parse(element.student_info))
      : {};
    //element["student_info"]=element.student_info != null?element.student_info.replace(/\"/g, ""):{};
    element.class_info != null
      ? (element["class_info"] = JSON.parse(element.class_info))
      : {};
    element.group_info != null
      ? (element["group_info"] = JSON.parse(element.group_info))
      : {};

    element.subject_info != null
      ? (element["subject_info"] = JSON.parse(element.subject_info))
      : {};
    element.teacher_info != null
      ? (element["teacher_info"] = JSON.parse(element.teacher_info))
      : {};
    element.academic_year_info != null
      ? (element["academic_year_info"] = JSON.parse(element.academic_year_info))
      : {};
    element.exam_type_info != null
      ? (element["exam_type_info"] = JSON.parse(element.exam_type_info))
      : {};
  });
  return rows;
};
var getRelationalQuery = (language) => `
JSON_OBJECT('id', c.id,'name',  ${
  language == constants.LANGUAGE_BN ? "c.name_bn" : "c.name"
}) AS class_info,
JSON_OBJECT('id', g.id,'name', ${
  language == constants.LANGUAGE_BN ? "g.name_bn" : "g.name"
}) AS group_info,
JSON_OBJECT('id', academicYear.id,'name', ${
  language == constants.LANGUAGE_BN
    ? "academicYear.name_bn"
    : "academicYear.name"
}) AS academic_year_info,
JSON_OBJECT('id', s.id,'name',${
  language == constants.LANGUAGE_BN ? "s.name_bn" : "s.name"
},'subject_code',s.subject_code) AS subject_info,
JSON_OBJECT('id', t.id,'first_name', ${
  language == constants.LANGUAGE_BN ? "t.first_name_bn" : "t.first_name"
},'middle_name',${
  language == constants.LANGUAGE_BN ? "t.middle_name_bn" : "t.middle_name"
},'last_name', ${
  language == constants.LANGUAGE_BN ? "t.last_name_bn" : "t.last_name"
}) AS teacher_info,
JSON_OBJECT('id', e.id,'name', ${
  language == constants.LANGUAGE_BN ? "e.name_bn" : "e.name"
}) AS exam_type_info
FROM ${constants.EXAM_MARKS_TABLE_NAME} as ${tObj}
LEFT JOIN ${
  constants.CLASS_ROOM_TABLE_NAME
} as cr ON ${tObj}.class_room_id = cr.id
LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON cr.class_id = c.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON cr.group_id = g.id
LEFT JOIN ${constants.SUBJECT_NAME_TABLE} as s ON ${tObj}.subject_id = s.id
LEFT JOIN ${constants.TEACHER_TABLE} as t ON ${tObj}.teacher_id = t.id
LEFT JOIN ${
  constants.ACADEMIC_YEAR_TABLE_NAME
} as ${ayObj} ON cr.academic_year_id = ${ayObj}.id
LEFT JOIN ${constants.EXAM_TYPE_TABLE_NAME} as e ON ${tObj}.exam_type_id = e.id
`;
var getRelationalQueryWithStudentDetails = (language) => `
JSON_OBJECT('id', t.id,'first_name',${
  language == constants.LANGUAGE_BN ? "t.first_name_bn" : "t.first_name"
} ,'middle_name',${
  language == constants.LANGUAGE_BN ? "t.middle_name_bn" : "t.middle_name"
},'last_name', ${
  language == constants.LANGUAGE_BN ? "t.last_name_bn" : "t.last_name"
}) AS teacher_info,
CONCAT('[',GROUP_CONCAT(JSON_OBJECT('id', st.id,'first_name',${
  language == constants.LANGUAGE_BN ? "st.first_name_bn" : "st.first_name"
},'last_name',${
  language == constants.LANGUAGE_BN ? "st.last_name_bn" : "st.last_name"
},'user_type',st.user_type,'user_id',st.user_id,
'roll_no',st.roll_no) ORDER BY st.roll_no ASC SEPARATOR ','),']') AS student_info 
FROM ${tName} as ${tObj}
LEFT JOIN ${constants.TEACHER_TABLE} as t ON ${tObj}.teacher_id = t.id
LEFT JOIN ${
  constants.STUDENT_TABLE
} as st ON JSON_CONTAINS(${tObj}.student_ids, JSON_ARRAY(st.id))
`;
exports.allFields = [
  "id",
  "class_room_id",
  "subject_id",
  "teacher_id",
  "exam_type_id",
  "exam_date",
  "total_mark",
  "pass_mark",
  "student_ids",
  "exam_marks",
  "is_published",
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
