const configs = require("../config/config.json");
const constants = require("../utils/constants");
const db = require("../config/mysqldb");
const statusCode = require("../utils/status_code");
const staticMessage = require("../utils/message");
const notificationController = require("../utils/notification_controller");

var tName = constants.CLASS_FEES_TABLE_NAME;
var tObj = "cf";

exports.addClassFees = (req, res) => {
  const sql = `SELECT * FROM ${tName} WHERE class_room_id = ? AND duration_id = ?`;
  db.query(
    sql,
    [req.body.class_room_id, req.body.duration_id],
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
                staticMessage.FEE(req.headers.language),
                staticMessage.NEW_FEE_UPLOADED(req.headers.language)
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
exports.getAllClassFees = (req, res) => {
  console.log("........getAllClassFees........");
  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }

  if (req.query.duration_id != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.duration_id = ?`;
    queryList.push(req.query.duration_id);
  }
  var sql;
  if (queryList.length > 0) {
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery(
    req.headers.language
  )} WHERE ${conditions} ORDER BY a.name DESC,d.priority ASC`;
  } else {
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery(
    req.headers.language
  )} ORDER BY a.name DESC,d.priority ASC`;
  }
  db.query(sql, queryList, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    // console.log(rows);
    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: parseRelationalDataToJson(rows),
    });
  });
};

exports.getFilteredClassFees = (req, res) => {
  console.log("........getAllClassFees........");
  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }

  if (req.query.duration_id != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.duration_id = ?`;
    queryList.push(req.query.duration_id);
  }
  // conditions += `${
  //   conditions.length > 0 ? "AND" : ""
  // } fc.student_id = ?`;
  // queryList.push(13);
  var sql;
  if (queryList.length > 0) {
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQueryWithFeeDetailsCollectionDetailsForSIngleStudent(
    req.query.student_id,
    req.headers.language
  )} WHERE ${conditions} GROUP BY ${tObj}.id ORDER BY d.priority ASC`;
  } else {
    return res.status(statusCode.STATUS_BAD_REQUEST).json({
      message: "Query filed cannot be emptly",
    });
  }
  db.query(sql, queryList, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    // console.log(rows);
    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: parseRelationalDataToJson(rows),
    });
  });
};
exports.getClassFeesById = (req, res) => {
  const id = req.params.id; // Get the ID from the request parameters
  var sql;

  sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQueryWithFeeDetails(
    req.headers.language
  )} WHERE ${tObj}.id = ? GROUP BY ${tObj}.id`;
  db.query(sql, [id], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    // console.log(rows);
    var result = parseRelationalDataToJson(rows);
    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: result.length > 0 ? result[0] : {},
    });
  });
};

exports.getClassFeesByClassRoomId = (req, res) => {
  const id = req.params.id; // Get the ID from the request parameters
  var sql;

  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }

  if (req.query.duration_id != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.duration_id = ?`;
    queryList.push(req.query.duration_id);
  }
  if (queryList.length > 0) {
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQueryWithFeeDetails(
    req.headers.language
  )} WHERE ${conditions} GROUP BY ${tObj}.id ORDER BY d.priority DESC`;
  } else {
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQueryWithFeeDetails(
    req.headers.language
  )} GROUP BY ${tObj}.id`;
  }

  db.query(sql, queryList, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    // console.log(rows);
    var result = parseRelationalDataToJson(rows);
    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: result,
    });
  });
};
exports.getClassFeesByQueryPerm = (req, res) => {
  const id = req.params.id; // Get the ID from the request parameters
  var sql;

  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }

  if (req.query.duration_id != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.duration_id = ?`;
    queryList.push(req.query.duration_id);
  }
  if (queryList.length > 0) {
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQueryWithFeeDetails(
    req.headers.language
  )} WHERE ${conditions} GROUP BY ${tObj}.id`;
  } else {
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQueryWithFeeDetails(
    req.headers.language
  )} GROUP BY ${tObj}.id`;
  }

  db.query(sql, queryList, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    // console.log(rows);
    var result = parseRelationalDataToJson(rows);
    return res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: result.length > 0 ? result[0] : {},
    });
  });
};
exports.updateClaaFees = (req, res) => {
  console.log(`.............update.......${req.body}`);
  // Construct the final UPDATE query string
  const sql = `SELECT * FROM ${tName} WHERE id != ? AND class_room_id = ? AND duration_id = ?`;

  db.query(
    sql,
    [req.params.id, req.body.class_room_id, req.body.duration_id],
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
          if (key === "updated_at" || key === "created_at") {
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
            return res.status(500).json({ error: err.message });
          }

          // Check if any row was updated
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found" });
          }
          await notificationController.sendNotificationToClassRoomIdsTopics(
            [req.body.class_room_id],
            staticMessage.FEE(req.headers.language),
            staticMessage.NEW_FEE_UPLOADED(req.headers.language)
          );
          // Return a success response
          res.status(200).json({
            message: staticMessage.UPDATED_SUCCESSFULLY(req.headers.language),
            data: result.affectedRows,
          });
        });
      }
    }
  );
};

//delete
exports.deleteClassFees = (req, res) => {
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
    if (element.pay_info != null)
      element["pay_info"] = JSON.parse(element.pay_info);
    element["fees_info"] =
      element.fees_info != null ? JSON.parse(element.fees_info) : {};
    element["class_info"] =
      element.class_info != null ? JSON.parse(element.class_info) : {};
    element["group_info"] =
      element.group_info != null ? JSON.parse(element.group_info) : {};
    element["duration_info"] =
      element.duration_info != null ? JSON.parse(element.duration_info) : {};
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
JSON_OBJECT('id', d.id,'name',${
  language == constants.LANGUAGE_BN ? "d.name_bn" : "d.name"
}) AS duration_info
FROM ${tName} as ${tObj}
LEFT JOIN ${
  constants.CLASS_ROOM_TABLE_NAME
} as cr ON ${tObj}.class_room_id = cr.id
LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON  cr.class_id = c.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON  cr.group_id = g.id
LEFT JOIN ${constants.DURATION_TABLE_NAME} as d ON  ${tObj}.duration_id = d.id
LEFT JOIN ${
  constants.ACADEMIC_YEAR_TABLE_NAME
} as a ON  cr.academic_year_id = a.id`;

var getRelationalQueryWithFeeDetails = (language) => `
JSON_OBJECT('id', c.id,'name',  ${
  language == constants.LANGUAGE_BN ? "c.name_bn" : "c.name"
}) AS class_info,
JSON_OBJECT('id', g.id,'name', ${
  language == constants.LANGUAGE_BN ? "g.name_bn" : "g.name"
}) AS group_info,
JSON_OBJECT('id', a.id,'name', ${
  language == constants.LANGUAGE_BN ? "a.name_bn" : "a.name"
}) AS academic_year_info,
JSON_OBJECT('id', d.id,'name',${
  language == constants.LANGUAGE_BN ? "d.name_bn" : "d.name"
}) AS duration_info,
JSON_ARRAYAGG(
        JSON_OBJECT(
            'id',ft.id,
            'name',ft.name,
             'name_bn',ft.name_bn,
            'amount', jt.amount
        )
    ) AS fees_info
FROM ${tName} as ${tObj}
LEFT JOIN ${
  constants.CLASS_ROOM_TABLE_NAME
} as cr ON ${tObj}.class_room_id = cr.id
LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON cr.class_id = c.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON cr.group_id = g.id
LEFT JOIN ${constants.DURATION_TABLE_NAME} as d ON ${tObj}.duration_id = d.id
LEFT JOIN ${
  constants.ACADEMIC_YEAR_TABLE_NAME
} as a ON cr.academic_year_id = a.id
JOIN JSON_TABLE(
    ${tObj}.class_fees, 
      '$[*]' COLUMNS (
          fee_type_id INT PATH '$.fee_type_id',
          amount VARCHAR(1000) PATH '$.amount'
      )
  ) AS jt ON TRUE
JOIN ${constants.FEE_TYPE_TABLE_NAME} as ft ON jt.fee_type_id = ft.id
`;

var getRelationalQueryWithFeeDetailsCollectionDetailsForSIngleStudent = (
  studentId,
  language
) => `
JSON_OBJECT('id', c.id,'name',  ${
  language == constants.LANGUAGE_BN ? "c.name_bn" : "c.name"
}) AS class_info,
JSON_OBJECT('id', g.id,'name', ${
  language == constants.LANGUAGE_BN ? "g.name_bn" : "g.name"
}) AS group_info,
JSON_OBJECT('id', a.id,'name', ${
  language == constants.LANGUAGE_BN ? "a.name_bn" : "a.name"
}) AS academic_year_info,
JSON_OBJECT('id', d.id,'name',${
  language == constants.LANGUAGE_BN ? "d.name_bn" : "d.name"
}) AS duration_info,
  (
    SELECT 
      JSON_OBJECT(
        'id', fc.id,
        'class_fees_id', fc.class_fees_id,
        'student_id', fc.student_id,
        'discount_amount', fc.discount_amount,
        'paid_amount', fc.paid_amount,
        'status', fc.status
      )
    FROM ${constants.FEES_COLLECTION_TABLE_NAME} fc
    WHERE fc.class_fees_id = ${tObj}.id AND student_id = ${studentId} LIMIT 1
  ) AS pay_info,
JSON_ARRAYAGG(
        JSON_OBJECT(
            'id',ft.id,
            'name',ft.name,
            'name_bn',ft.name_bn,
            'amount', jt.amount
        )
    ) AS fees_info
FROM ${tName} as ${tObj}
LEFT JOIN ${
  constants.CLASS_ROOM_TABLE_NAME
} as cr ON ${tObj}.class_room_id = cr.id
LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON cr.class_id = c.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON cr.group_id = g.id
LEFT JOIN ${constants.DURATION_TABLE_NAME} as d ON ${tObj}.duration_id = d.id
LEFT JOIN ${
  constants.ACADEMIC_YEAR_TABLE_NAME
} as a ON cr.academic_year_id = a.id
JOIN JSON_TABLE(
    ${tObj}.class_fees, 
      '$[*]' COLUMNS (
          fee_type_id INT PATH '$.fee_type_id',
          amount VARCHAR(1000) PATH '$.amount'
      )
  ) AS jt ON TRUE
JOIN ${constants.FEE_TYPE_TABLE_NAME} as ft ON jt.fee_type_id = ft.id
`;
//JSON_CONTAINS(att.student_ids, JSON_ARRAY(st.id))
//FIND_IN_SET(p.product_id, u.product_ids) > 0
exports.allFields = [
  "id",
  "class_room_id",
  "duration_id",
  "class_fees",
  // "student_ids",
  // "student_pay_info",
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
