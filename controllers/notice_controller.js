const configs = require("../config/config.json");
const constants = require("../utils/constants");
const db = require("../config/mysqldb");
const statusCode = require("../utils/status_code");
const staticMessage = require("../utils/message");
const notificationController = require("../utils/notification_controller");
const tName = constants.NOTICE_COLLECTION_NAME;
const tObj = "nt";

exports.addNotice = (req, res) => {
  // const sql = `SELECT * FROM ${tName} WHERE class_room_id = ? AND notice_date = ?`;
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
        await notificationController.sendNotificationToAllStudentTopics(
          ["student"],
          staticMessage.NOTICE(req.headers.language),
          req.body.title
        );
        res.status(statusCode.STATUS_CREATED).json({
          message: staticMessage.SUCCESS(req.headers.language),
          data: rows,
        });
      }
    }
  );
};
exports.getAllNotice = async (req, res) => {
  //console.log(`........fcm_auth_token........${req.fcm_auth_token}.....`);
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

  if (req.query.notice_date != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.notice_date = ?`;
    queryList.push(req.query.notice_date);
  }
  if (req.query.academic_year_id != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.academic_year_id = ?`;
    queryList.push(req.query.academic_year_id);
  }
  if (req.query.from_date != null && req.query.to_date != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.notice_date BETWEEN ? AND ?`;
    queryList.push(req.query.from_date);
    queryList.push(req.query.to_date);
  }
  //console.log(`........conditions........${conditions}.....${queryList}`);
  var sql;

  if (queryList.length > 0) {
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery} WHERE ${conditions} ORDER BY ${tObj}.notice_date DESC`;
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
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery} ORDER BY ${tObj}.notice_date DESC`;
    db.query(sql, (err, rows, fields) => {
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
  }
};

exports.getNoticesForDashBoard = (req, res) => {
  var sql;

  sql = `SELECT 
 ${this.selectedFields(tObj)},
 ${getRelationalQuery} ORDER BY ${tObj}.notice_date DESC LIMIT 5`;
  db.query(sql, (err, rows, fields) => {
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
exports.getNoticeById = (req, res) => {
  const sql = `SELECT 
  ${this.selectedFields(tName)},
  ${getRelationalQuery} WHERE ${tName}.id = ?`;

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
exports.updateNotice = (req, res) => {
  console.log(`.............update.......${req.body}`);
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
  const query = `UPDATE ${tName} SET ${setClause.join(", ")} WHERE id = ?`;
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
    await notificationController.sendNotificationToAllStudentTopics(
      ["student"],
      staticMessage.NOTICE(req.headers.language),
      req.body.title
    );
    // Return a success response
    res.status(statusCode.STATUS_OK).json({
      message: staticMessage.UPDATED_SUCCESSFULLY(req.headers.language),
      data: result.affectedRows,
    });
  });
};

//delete
exports.deleteNotice = (req, res) => {
  const id = req.params.id; // Get the ID from the request parameters

  // SQL query to delete the record from the database
  const sql = `DELETE FROM ${tName} WHERE id = ?`;

  // Execute the SQL query
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting User:", err);
      return res
        .status(statusCode.STATUS_BAD_REQUEST)
        .json({
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
    return res
      .status(statusCode.STATUS_OK)
      .json({
        message: staticMessage.DELETED_SUCCESSFULLY(req.headers.language),
      });
  });
};

var parseRelationalDataToJson = (rows) => {
  // Format the results as JSON objects
  rows.forEach((element) => {
    //  delete element.password;
    //  delete element.department_id;

    element["class_info"] =
      element.class_info != null ? JSON.parse(element.class_info) : {};
    element["group_info"] =
      element.group_info != null ? JSON.parse(element.group_info) : {};
    element["academic_year_info"] =
      element.academic_year_info != null
        ? JSON.parse(element.academic_year_info)
        : {};
  });
  return rows;
};
var getRelationalQuery = `JSON_OBJECT('id', c.id,'name', c.name) AS class_info,
JSON_OBJECT('id', g.id,'name', g.name) AS group_info,
JSON_OBJECT('id', a.id,'name', a.name) AS academic_year_info
FROM ${tName} as ${tObj}
LEFT JOIN ${constants.CLASS_ROOM_TABLE_NAME} as cr ON ${tObj}.class_room_ids = cr.id
LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON cr.class_id = c.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON cr.group_id = g.id
LEFT JOIN ${constants.ACADEMIC_YEAR_TABLE_NAME} as a ON cr.academic_year_id = a.id`;

//JSON_CONTAINS(att.student_ids, JSON_ARRAY(st.id))
//FIND_IN_SET(p.product_id, u.product_ids) > 0
exports.allFields = [
  "id",
  "class_room_ids",
  "academic_year_id",
  "notice_date",
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
