const configs = require("../config/config.json");
const constants = require("../utils/constants");
const db = require("../config/mysqldb");
const statusCode = require("../utils/status_code");
const staticMessage = require("../utils/message");
const tName = constants.ATTENDANCE_TABLE_NAME;
const tObj = "att";

exports.addAttendence = (req, res) => {
  const sql = `SELECT * FROM ${constants.ATTENDANCE_TABLE_NAME} WHERE class_room_id = ? AND subject_id = ? AND attendance_date = ?`;
  db.query(
    sql,
    [req.body.class_room_id, req.body.subject_id, req.body.attendance_date],
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
    }
  );
};
exports.getAllAttendence = (req, res) => {
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

  if (req.query.from_date != null && req.query.to_date != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.attendance_date BETWEEN ? AND ?`;
    queryList.push(req.query.from_date);
    queryList.push(req.query.to_date);
  }
  console.log(`........conditions........${conditions}.....${queryList}`);
  var sql;

  if (queryList.length > 0)
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery(
    req.headers.language
  )} WHERE ${conditions} ORDER BY ${tObj}.attendance_date DESC`;
  else
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery(
    req.headers.language
  )} ORDER BY ${tObj}.attendance_date DESC`;

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
exports.getLatestAttendanceDate = (req, res, next) => {
  var attendance_date = req.query.attendance_date;
  if (req.query.class_room_id == null) {
    return res.status(statusCode.STATUS_BAD_REQUEST).json({
      message: staticMessage.FAILED(req.headers.language),
      data: [],
    });
  } else {
    //console.log(`.......attendance_date............${req.query.attendance_date}`);

    if (
      attendance_date === null ||
      attendance_date === undefined ||
      attendance_date === ""
    ) {
      // console.log(
      //   `.......attendance_date............${req.query.attendance_date}`
      // );
      var conditions = "";
      var queryList = [];
      if (req.query.class_room_id != null) {
        conditions += `
        ${conditions.length > 0 ? " AND " : ""} ${tObj}.class_room_id = ?`;
        queryList.push(req.query.class_room_id);
      }

      if (req.query.subject_id != null) {
        conditions += `${
          conditions.length > 0 ? " AND " : ""
        } ${tObj}.subject_id = ?`;
        queryList.push(req.query.subject_id);
      }
      // if (req.query.from_date != null && req.query.to_date != null) {
      //   conditions += `${
      //     conditions.length > 0 ? " AND " : ""
      //   } ${tObj}.attendance_date BETWEEN ? AND ?`;
      //   queryList.push(req.query.from_date);
      //   queryList.push(req.query.to_date);
      // }
      // console.log(
      //   `.....conditions............${conditions}......queryList.....${queryList}`
      // );
      // Step 1: Get the latest date from the most recent record
      db.query(
        `SELECT attendance_date as latest_attendance_date FROM ${tName} as ${tObj} WHERE ${conditions} ORDER BY attendance_date DESC LIMIT 1`,
        queryList,
        (err, result) => {
          if (err) {
            console.log(`.....err............${err}`);
            return res.status(500).send("Database error");
          }
          if (result.length > 0) {
            const latestDate = result[0].latest_attendance_date;
            req.query.attendance_date = latestDate;
            console.log(
              `.....latestDate..attendance_date............${req.query.attendance_date}`
            );
            next();
          } else {
            return res.status(statusCode.STATUS_OK).json({
              message: staticMessage.SUCCESS(req.headers.language),
              data: result.length > 0 ? result[0] : {},
            });
          }
        }
      );
    } else {
      next();
    }
  }
};

exports.getPreviousAttendanceDate = (req, res, next) => {
  var attendance_date = req.query.attendance_date;

  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }
  if (req.query.attendance_date != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.attendance_date < ?`;
    queryList.push(req.query.attendance_date);
  }

  if (req.query.subject_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.subject_id = ?`;
    queryList.push(req.query.subject_id);
  }
  // if (req.query.from_date != null && req.query.to_date != null) {
  //   conditions += `${
  //     conditions.length > 0 ? " AND " : ""
  //   } ${tObj}.attendance_date BETWEEN ? AND ?`;
  //   queryList.push(req.query.from_date);
  //   queryList.push(req.query.to_date);
  // }

  // Step 1: Get the latest date from the most recent record
  db.query(
    `SELECT attendance_date as previous_attendance_date FROM ${tName} as ${tObj} WHERE ${conditions} ORDER BY attendance_date DESC LIMIT 1`,
    queryList,
    (err, result) => {
      if (err) {
        return res.status(500).send("Database error");
      }
      if (result.length > 0) {
        const prevDate = result[0].previous_attendance_date;
        req.query.prev_attendance_date = prevDate;
        console.log(
          `.......prev_attendance_date............${req.query.prev_attendance_date}`
        );
        next();
      } else {
        next();
      }
    }
  );
};

exports.getNextAttendanceDate = (req, res, next) => {
  var attendance_date = req.query.attendance_date;

  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }
  if (req.query.attendance_date != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.attendance_date > ?`;
    queryList.push(req.query.attendance_date);
  }

  if (req.query.subject_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.subject_id = ?`;
    queryList.push(req.query.subject_id);
  }
  // if (req.query.from_date != null && req.query.to_date != null) {
  //   conditions += `${
  //     conditions.length > 0 ? " AND " : ""
  //   } ${tObj}.attendance_date BETWEEN ? AND ?`;
  //   queryList.push(req.query.from_date);
  //   queryList.push(req.query.to_date);
  // }
  console.log(
    `.............getNextAttendanceDate......conditions..${conditions}`
  );
  // Step 1: Get the latest date from the most recent record
  db.query(
    `SELECT attendance_date as next_attendance_date FROM ${tName} as ${tObj} WHERE ${conditions} ORDER BY attendance_date ASC LIMIT 1`,
    queryList,
    (err, result) => {
      if (err) {
        return res.status(500).send("Database error");
      }
      if (result.length > 0) {
        const nextDate = result[0].next_attendance_date;
        req.query.next_attendance_date = nextDate;
        console.log(
          `.......next_attendance_date............${req.query.next_attendance_date}`
        );
        next();
      } else {
        next();
      }
    }
  );
};
exports.getParticularDateAttendance = (req, res) => {
  var attendance_date = req.query.attendance_date;

  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }
  if (req.query.attendance_date != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.attendance_date = ?`;
    queryList.push(req.query.attendance_date);
  }
  console.log(
          `....final...condition............${conditions}...queryList......${queryList}`
        );
  if (req.query.subject_id != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.subject_id = ?`;
    queryList.push(req.query.subject_id);
  }

  db.query(
    `SELECT ${this.selectedFields(tObj)},
  ${getRelationalQueryWithStudentDetails(
    req.headers.language
  )} WHERE ${conditions} GROUP BY ${tObj}.id LIMIT 1`,
    queryList,
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Database error");
      }
      var resultObj = parseRelationalDataToJson(result);
      return res.status(statusCode.STATUS_OK).json({
        message: staticMessage.SUCCESS(req.headers.language),
        data: resultObj.length > 0 ? resultObj[0] : {},
        previous_attendance_date: req.query.prev_attendance_date,
        next_attendance_date: req.query.next_attendance_date,
      });
    }
  );
};
exports.getFilteredAttendance = (req, res) => {
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

  if (req.query.from_date != null && req.query.to_date != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.attendance_date BETWEEN ? AND ?`;
    queryList.push(req.query.from_date);
    queryList.push(req.query.to_date);
  }
  console.log(`........conditions........${conditions}.....${queryList}`);
  var sql;

  if (queryList.length > 0)
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery(
    req.headers.language
  )} WHERE ${conditions} ORDER BY ${tObj}.attendance_date DESC`;
  else
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery(
    req.headers.language
  )} ORDER BY ${tObj}.attendance_date DESC`;

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
exports.getAttendanceWithStudentsDetails = (req, res) => {
  var conditions = "";
  var queryList = [];
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

  if (req.query.from_date != null && req.query.to_date != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.attendance_date BETWEEN ? AND ?`;
    queryList.push(req.query.from_date);
    queryList.push(req.query.to_date);
  }
  console.log(`........conditions........${conditions}.....${queryList}`);
  var sql;
  // First, increase the group_concat_max_len to handle larger datasets
  db.query("SET SESSION group_concat_max_len = 100000000;", (err) => {
    if (err) {
      console.error("Error setting group_concat_max_len:", err);
      return res.status(500).json({ error: "Failed to set session variable" });
    }
  });

  if (queryList.length > 0) {
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQueryWithStudentDetails(
    req.headers.language
  )} WHERE ${conditions} GROUP BY ${tObj}.id ORDER BY ${tObj}.attendance_date DESC`;
  } else {
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQueryWithStudentDetails(
    req.headers.language
  )} ORDER BY ${tObj}.attendance_date DESC`;
  }
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

exports.getAttendanceForPerticularMonth = (req, res) => {
  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }
  console.log(`.....getAttendanceForPerticularMonth........${conditions}`);
  // if (req.query.group_id != null) {
  //   conditions += `${conditions.length > 0 ? "AND" : ""} ${tObj}.group_id = ?`;
  //   queryList.push(req.query.group_id);
  // }

  if (req.query.month != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } MONTH(${tObj}.attendance_date) = ?`;
    queryList.push(req.query.month);
  }

  if (req.query.subject_id != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.subject_id = ?`;
    queryList.push(req.query.subject_id);
  }

  if (req.query.from_date != null && req.query.to_date != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.attendance_date BETWEEN ? AND ?`;
    queryList.push(req.query.from_date);
    queryList.push(req.query.to_date);
  }
  console.log(`........conditions........${conditions}.....${queryList}`);
  var sql;
  // First, increase the group_concat_max_len to handle larger datasets
  db.query("SET SESSION group_concat_max_len = 100000000;", (err) => {
    if (err) {
      console.error("Error setting group_concat_max_len:", err);
      return res.status(500).json({ error: "Failed to set session variable" });
    }
  });

  if (queryList.length > 0) {
    sql = `SELECT 
  ${this.selectedFields(
    tObj
  )} FROM ${tName} as ${tObj}  WHERE ${conditions} GROUP BY ${tObj}.id ORDER BY ${tObj}.attendance_date DESC`;
  } else {
    sql = `SELECT 
  ${this.selectedFields(
    tObj
  )} FROM ${tName} as ${tObj} ORDER BY ${tObj}.attendance_date DESC`;
  }
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
      data: rows,
    });
  });
};
exports.updateAttendance = (req, res) => {
  console.log(`.............update.......${req.body}`);
  // Construct the final UPDATE query string
  const sql = `SELECT * FROM ${tName} WHERE id != ? AND class_room_id = ? AND subject_id = ? AND attendance_date = ?`;

  db.query(
    sql,
    [
      req.params.id,
      req.body.class_room_id,
      req.body.subject_id,
      req.body.attendance_date,
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
        db.query(query, values, (err, result) => {
          if (err) {
            return res
              .status(statusCode.STATUS_BAD_REQUEST)
              .json({ error: err.message });
          }

          // Check if any row was updated
          if (result.affectedRows === 0) {
            return res
              .status(statusCode.STATUS_BAD_REQUEST)
              .json({ message: "Item not found" });
          }

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
exports.deleteAttendence = (req, res) => {
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

var getRelationalQueryWithStudentDetails = (language) => `
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
}) AS teacher_info,
CONCAT('[',GROUP_CONCAT(JSON_OBJECT('id', st.id,'first_name',${
  language == constants.LANGUAGE_BN ? "st.first_name_bn" : "st.first_name"
},'last_name',${
  language == constants.LANGUAGE_BN ? "st.last_name_bn" : "st.last_name"
},'user_type',st.user_type,'user_id',st.user_id,
'roll_no',st.roll_no) ORDER BY st.roll_no ASC SEPARATOR ','),']') AS student_info 
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
} as a ON cr.academic_year_id = a.id
LEFT JOIN ${
  constants.STUDENT_TABLE
} as st ON JSON_CONTAINS(${tObj}.student_ids, JSON_ARRAY(st.id))
`;
//JSON_CONTAINS(att.student_ids, JSON_ARRAY(st.id))
//FIND_IN_SET(p.product_id, u.product_ids) > 0
exports.allStudentField = [
  "id",
  "class_room_id",
  "subject_id",
  "teacher_id",
  "attendance_date",
  "student_ids",
  "attendance",
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
  this.allStudentField.forEach((element) => {
    if (!excludedField.includes(element))
      selectedField.push(`${obj}.${element}`);
  });
  return selectedField;
};
