const configs = require("../config/config.json");
const constants = require("../utils/constants");
const db = require("../config/mysqldb");
const statusCode = require("../utils/status_code");
const staticMessage = require("../utils/message");
const notificationController = require("../utils/notification_controller");

const tName = constants.HOMEWORK_COLLECTION_NAME;
const tObj = "hw";

exports.addHomeWork = (req, res) => {
  const sql = `SELECT * FROM ${tName} WHERE class_room_id = ? AND subject_id = ? AND home_work_date = ?`;
  db.query(
    sql,
    [req.body.class_room_id, req.body.subject_id, req.body.home_work_date],
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
              await notificationController.sendNotificationToClassRoomIdsTopics(
                [req.body.class_room_id],
                staticMessage.HOME_WORK(req.headers.language),
                staticMessage.NEW_HOMEWORK_UPLOADED(req.headers.language)
              );
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
exports.getAllHomeWork = (req, res) => {
  var conditions = "";
  var queryList = [];
  // if (req.query.class_id != null) {
  //   conditions += `${tObj}.class_id = ?`;
  //   queryList.push(req.query.class_id);
  // }

  if (req.query.class_room_id != null) {
    conditions += `${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }
  // if (req.query.group_id != null) {
  //   conditions += `${conditions.length > 0 ? "AND" : ""} ${tObj}.group_id = ?`;
  //   queryList.push(req.query.group_id);
  // }

  // if (req.query.academic_year_id != null) {
  //   conditions += `${
  //     conditions.length > 0 ? "AND" : ""
  //   } ${tObj}.academic_year_id = ?`;
  //   queryList.push(req.query.academic_year_id);
  // }

  if (req.query.subject_id != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.subject_id = ?`;
    queryList.push(req.query.subject_id);
  }

  if (req.query.home_work_date != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.home_work_date = ?`;
    queryList.push(req.query.home_work_date);
  }
  if (req.query.from_date != null && req.query.to_date != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.home_work_date BETWEEN ? AND ?`;
    queryList.push(req.query.from_date);
    queryList.push(req.query.to_date);
  }
  console.log(`........conditions........${conditions}.....${queryList}`);
  var sql;

  if (queryList.length > 0) {
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery(
    req.headers.language
  )} WHERE ${conditions} ORDER BY ${tObj}.home_work_date DESC`;
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
    //  console.log(rows);
    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: [],
    });
  }
};

exports.getLatestHomeWorkDate = (req, res, next) => {
  var home_work_date = req.query.home_work_date;
  if (req.query.class_room_id == null) {
    return res.status(statusCode.STATUS_BAD_REQUEST).json({
      message: staticMessage.FAILED(req.headers.language),
      data: [],
    });
  } else {
    //console.log(`.......home_work_date............${req.query.home_work_date}`);

    if (
      home_work_date === null ||
      home_work_date === undefined ||
      home_work_date === ""
    ) {
      // console.log(
      //   `.......home_work_date............${req.query.home_work_date}`
      // );
      var conditions = "";
      var queryList = [];
      if (req.query.class_room_id != null) {
        conditions += `${tObj}.class_room_id = ?`;
        queryList.push(req.query.class_room_id);
      }
      if (req.query.from_date != null && req.query.to_date != null) {
        conditions += `${
          conditions.length > 0 ? " AND " : ""
        } ${tObj}.home_work_date BETWEEN ? AND ?`;
        queryList.push(req.query.from_date);
        queryList.push(req.query.to_date);
      }
      console.log(
        `.....conditions............${conditions}......queryList.....${queryList}`
      );
      // Step 1: Get the latest date from the most recent record
      db.query(
        `SELECT home_work_date as latest_home_work_date FROM ${tName} as ${tObj} WHERE ${conditions} ORDER BY home_work_date DESC LIMIT 1`,
        queryList,
        (err, result) => {
          if (err) {
            console.log(
              `.....err............${err}`
            );
            return res.status(500).send("Database error");
          }
          if (result.length > 0) {
            const latestDate = result[0].latest_home_work_date;
            req.query.home_work_date = latestDate;
            console.log(
              `.....latestDate..home_work_date............${req.query.home_work_date}`
            );
            next();
          } else {
            return res.status(statusCode.STATUS_OK).json({
              message: staticMessage.SUCCESS(req.headers.language),
              data: result,
            });
          }
        }
      );
    } else {
      next();
    }
  }
};

exports.getPreviousHomeWorkDate = (req, res, next) => {
  var home_work_date = req.query.home_work_date;

  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }
  if (req.query.home_work_date != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.home_work_date < ?`;
    queryList.push(req.query.home_work_date);
  }
  if (req.query.from_date != null && req.query.to_date != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.home_work_date BETWEEN ? AND ?`;
    queryList.push(req.query.from_date);
    queryList.push(req.query.to_date);
  }


  // Step 1: Get the latest date from the most recent record
  db.query(
    `SELECT home_work_date as previous_home_work_date FROM ${tName} as ${tObj} WHERE ${conditions} ORDER BY home_work_date DESC LIMIT 1`,
    queryList,
    (err, result) => {
      if (err) {
        return res.status(500).send("Database error");
      }
      if (result.length > 0) {
        const prevDate = result[0].previous_home_work_date;
        req.query.prev_home_work_date = prevDate;
        next();
      } else {
        next();
      }
    }
  );
};

exports.getNextHomeWorkDate = (req, res, next) => {
  var home_work_date = req.query.home_work_date;

  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }
  if (req.query.home_work_date != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.home_work_date > ?`;
    queryList.push(req.query.home_work_date);
  }
  if (req.query.from_date != null && req.query.to_date != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.home_work_date BETWEEN ? AND ?`;
    queryList.push(req.query.from_date);
    queryList.push(req.query.to_date);
  }
  // Step 1: Get the latest date from the most recent record
  db.query(
    `SELECT home_work_date as next_home_work_date FROM ${tName} as ${tObj} WHERE ${conditions} ORDER BY home_work_date ASC LIMIT 1`,
    queryList,
    (err, result) => {
      if (err) {
        return res.status(500).send("Database error");
      }
      if (result.length > 0) {
        const nextDate = result[0].next_home_work_date;
        req.query.next_home_work_date = nextDate;
        next();
      } else {
        next();
      }
    }
  );
};
exports.getParticularDateHomeWork = (req, res) => {
  var home_work_date = req.query.home_work_date;
  // return res.status(statusCode.STATUS_OK).json({
  //   message: staticMessage.SUCCESS(req.headers.language),
  //   data: {
  //     home_work_date: req.query.home_work_date,
  //     prev_home_work_date: req.query.prev_home_work_date,
  //   },
  // });
  console.log(
    `.......prev....homework date............${req.query.prev_home_work_date}`
  );
  db.query(
    `SELECT ${this.selectedFields(tObj)},
  ${getRelationalQuery(
    req.headers.language
  )} WHERE ${tObj}.class_room_id = ? AND ${tObj}.home_work_date = ?`,
    [req.query.class_room_id, req.query.home_work_date],
    (err, result) => {
      if (err) {
        return res.status(500).send("Database error");
      }
      return res.status(statusCode.STATUS_OK).json({
        message: staticMessage.SUCCESS(req.headers.language),
        data: parseRelationalDataToJson(result),
        previous_home_work_date: req.query.prev_home_work_date,
        next_home_work_date: req.query.next_home_work_date,
      });
    }
  );
};
exports.getHomeWorkBuId = (req, res) => {
  const sql = `SELECT 
  ${this.selectedFields(tName)},
  ${getRelationalQuery(req.headers.language)} WHERE ${tName}.id = ?`;

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
exports.updateHomeWork = (req, res) => {
  console.log(`.............update.......${req.body}`);
  // Construct the final UPDATE query string
  const sql = `SELECT * FROM ${tName} WHERE id != ? AND class_room_id = ? AND subject_id = ? AND home_work_date = ?`;

  db.query(
    sql,
    [
      req.params.id,
      req.body.class_room_id,
      req.body.subject_id,
      req.body.home_work_date,
    ],
    (err, rows, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return res.status(401).json({
          message: staticMessage.FAILED(req.headers.language),
          err,
        });
      }

      if (rows.length > 0) {
        console.log(rows);
        return res.status(401).json({
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
            //  key === "academic_year_id" ||
            //  key === "attendance_date"
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
              .status(statusCode.STATUS_BAD_REQUEST)
              .json({ message: staticMessage.NOT_FOUND(req.headers.language) });
          }
          await notificationController.sendNotificationToClassRoomIdsTopics(
            [req.body.class_room_id],
            staticMessage.HOME_WORK(req.headers.language),
            staticMessage.NEW_HOMEWORK_UPLOADED(req.headers.language)
          );
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
exports.deleteHomeWork = (req, res) => {
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

    element["student_info"] =
      element.student_info != null ? JSON.parse(element.student_info) : {};
    //element["student_info"]=element.student_info != null?element.student_info.replace(/\"/g, ""):{};
    element["class_info"] =
      element.class_info != null ? JSON.parse(element.class_info) : {};
    element["group_info"] =
      element.group_info != null ? JSON.parse(element.group_info) : {};
    element["subject_info"] =
      element.subject_info != null && element.subject_info != 0
        ? JSON.parse(element.subject_info)
        : {};
    element["teacher_info"] =
      element.teacher_info != null ? JSON.parse(element.teacher_info) : {};
    element["academic_year_info"] =
      element.academic_year_info != null
        ? JSON.parse(element.academic_year_info)
        : {};
  });
  return rows;
};
// JSON_OBJECT('id', c.id,'name', c.name) AS class_info,
// JSON_OBJECT('id', g.id,'name', g.name) AS group_info,
// JSON_OBJECT('id', s.id,'name', s.name,'subject_code',s.subject_code) AS subject_info,
// JSON_OBJECT('id', t.id,'first_name', t.first_name,'middle_name', t.middle_name,'last_name', t.last_name) AS teacher_info,
// JSON_OBJECT('id', a.id,'name', a.name) AS academic_year_info
var getRelationalQuery = (language) => `
JSON_OBJECT('id', c.id,'name',  ${
  language == constants.LANGUAGE_BN ? "c.name_bn" : "c.name"
}) AS class_info,
JSON_OBJECT('id', g.id,'name', ${
  language == constants.LANGUAGE_BN ? "g.name_bn" : "g.name"
}) AS group_info,
JSON_OBJECT('id', a.id,'name', ${
  language == constants.LANGUAGE_BN ? "a.name_bn" : "a.name"
}) AS academic_year_info,
JSON_OBJECT('id', s.id,'name', ${
  language == constants.LANGUAGE_BN ? "s.name_bn" : "s.name"
},'subject_code',s.subject_code) AS subject_info,
JSON_OBJECT('id', t.id,'first_name',${
  language == constants.LANGUAGE_BN ? "t.first_name_bn" : "t.first_name"
} ,'middle_name',${
  language == constants.LANGUAGE_BN ? "t.middle_name_bn" : "t.middle_name"
},'last_name', ${
  language == constants.LANGUAGE_BN ? "t.last_name_bn" : "t.last_name"
}) AS teacher_info
FROM ${tName} as ${tObj}
LEFT JOIN ${
  constants.CLASS_ROOM_TABLE_NAME
} as cr ON ${tObj}.class_room_id = cr.id
LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON cr.class_id = c.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON cr.group_id = g.id
LEFT JOIN ${constants.SUBJECT_NAME_TABLE} as s ON ${tObj}.subject_id = s.id
LEFT JOIN ${constants.TEACHER_TABLE} as t ON ${tObj}.teacher_id = t.id
LEFT JOIN ${
  constants.ACADEMIC_YEAR_TABLE_NAME
} as a ON cr.academic_year_id = a.id`;

//JSON_CONTAINS(att.student_ids, JSON_ARRAY(st.id))
//FIND_IN_SET(p.product_id, u.product_ids) > 0
exports.allFields = [
  "id",
  "class_room_id",
  "subject_id",
  "teacher_id",
  "home_work_date",
  "title",
  "description",
  "attachment",
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
