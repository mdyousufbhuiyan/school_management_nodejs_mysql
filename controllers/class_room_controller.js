const configs = require("../config/config.json");
const constants = require("../utils/constants");
const db = require("../config/mysqldb");
const statusCode = require("../utils/status_code");
const message = require("../utils/message");
var tName = constants.CLASS_ROOM_TABLE_NAME;
var tObj = "cr";

exports.addClassRoom = (req, res) => {
  const sql = `SELECT * FROM ${tName} WHERE class_id = ? AND group_id = ? AND academic_year_id = ?`;
  db.query(
    sql,
    [req.body.class_id, req.body.group_id, req.body.academic_year_id],
    (err, rows, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: message.FAILED(req.headers.language),
          err,
        });
      }
      if (rows.length > 0) {
        console.log(rows);
        return res.status(statusCode.STATUS_CONFLICT).json({
          message: message.ALREADY_EXISTS(req.headers.language),
        });
      } else {
        db.query(
          `INSERT INTO ${tName} SET ?`,
          req.body,
          (err, rows, fields) => {
            if (err instanceof Error) {
              console.log(err);
              return res.status(statusCode.STATUS_BAD_REQUEST).json({
                message: message.FAILED(req.headers.language),
                error: err,
              });
            } else {
              res.status(statusCode.STATUS_CREATED).json({
                message: message.SUCCESS(req.headers.language),
                data: rows,
              });
            }
          }
        );
      }
    }
  );
};
exports.getLatestAcademicYear = (req, res, next) => {
  console.log(`.........req.query.academic_year_id.............${req.query.academic_year_id}`);
  if (req.query.academic_year_id != null && req.query.academic_year_id != '') {
    next();
  } else {
    const sql = `SELECT 
    a.id, ${
      req.headers.language == constants.LANGUAGE_BN ? "a.name_bn" : "a.name"
    } as name 
   FROM ${tName} as ${tObj}
   LEFT JOIN ${
      constants.ACADEMIC_YEAR_TABLE_NAME
    } as a ON ${tObj}.academic_year_id = a.id ORDER BY a.name DESC
      LIMIT 1`;

    db.query(sql, (err, rows, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: staticMessage.FAILED(req.headers.language),
          error: err,
        });
      }
     

      if (rows.length > 0) {
         console.log(rows);
        req.query.academic_year_id = rows[0]["id"];
        next();
      } else {
        return res.status(statusCode.STATUS_OK).json({
          message: staticMessage.SUCCESS(req.headers.language),
          data: [],
        });
      }

    });
  }
};
exports.getAllClassRooms = (req, res) => {
  var conditions = "";
  var queryList = [];
  if (req.query.class_id != null) {
    conditions += `${tObj}.class_id = ?`;
    queryList.push(req.query.class_id);
  }
  if (req.query.group_id != null) {
    conditions += `${conditions.length > 0 ? "AND" : ""} ${tObj}.group_id = ?`;
    queryList.push(req.query.group_id);
  }

  if (req.query.academic_year_id != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.academic_year_id = ?`;
    queryList.push(req.query.academic_year_id);
  }
  if (queryList.length > 0) {
    const sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery(
    req.headers.language
  )} WHERE ${conditions} ORDER BY a.name DESC ,g.name ASC`;

    db.query(sql, queryList, (err, rows, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: "Failed",
          error: err,
        });
      }
      // console.log(rows);
      return res.status(statusCode.STATUS_OK).json({
        message: "Success",
        data: parseRelationalDataToJson(rows),
      });
    });
  } else {
    return res.status(statusCode.STATUS_OK).json({
      message: message.SUCCESS(req.headers.language),
      data: [],
    });
  }
};
exports.getAllClassRoomsForDropDown = (req, res) => {
  console.log("........getAllClassRoomsForDropDown........");
  const sql = `SELECT ${tObj}.id,${tObj}.class_id,${tObj}.group_id,${tObj}.academic_year_id,${
    req.headers.language == constants.LANGUAGE_BN ? "c.name_bn" : "c.name"
  } as class_name, ${
    req.headers.language == constants.LANGUAGE_BN ? "g.name_bn" : "g.name"
  } as group_name,${
    req.headers.language == constants.LANGUAGE_BN ? "a.name_bn" : "a.name"
  } as academic_year_name 
    FROM ${tName} as ${tObj}
LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON  ${tObj}.class_id = c.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON  ${tObj}.group_id = g.id
LEFT JOIN ${
    constants.ACADEMIC_YEAR_TABLE_NAME
  } as a ON  ${tObj}.academic_year_id = a.id ORDER BY a.name DESC ,g.name ASC`;

  db.query(sql, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: message.FAILED(req.headers.language),
        error: err,
      });
    }
    // console.log(rows);
    return res.status(statusCode.STATUS_OK).json({
      message: message.SUCCESS(req.headers.language),
      data: rows,
    });
  });
};

exports.updateClassRooms = (req, res) => {
  console.log(`.............update.......${req.body}`);
  // Construct the final UPDATE query string
  const sql = `SELECT * FROM ${tName} WHERE id != ? AND class_id = ? AND group_id = ? AND academic_year_id = ?`;

  db.query(
    sql,
    [
      req.params.id,
      req.body.class_id,
      req.body.group_id,
      req.body.academic_year_id,
    ],
    (err, rows, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: message.FAILED(req.headers.language),
          err,
        });
      }

      if (rows.length > 0) {
        console.log(rows);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: message.ALREADY_EXISTS(req.headers.language),
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
              .json({ message: message.NOT_FOUND(req.headers.language) });
          }

          // Return a success response
          res.status(statusCode.STATUS_OK).json({
            message: message.UPDATED_SUCCESSFULLY(req.headers.language),
            data: result.affectedRows,
          });
        });
      }
    }
  );
};

//delete
exports.deleteClassRooms = (req, res) => {
  const id = req.params.id; // Get the ID from the request parameters

  // SQL query to delete the record from the database
  const sql = `DELETE FROM ${tName} WHERE id = ?`;

  // Execute the SQL query
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting User:", err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: message.FAILED_TO_DELETE(req.headers.language),
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res
        .status(statusCode.STATUS_NOT_FOUND)
        .json({ message: message.NOT_FOUND(req.headers.language) });
    }

    // If the record is deleted successfully
    return res
      .status(statusCode.STATUS_OK)
      .json({ message: message.UPDATED_SUCCESSFULLY(req.headers.language) });
  });
};

var getRelationalQuery = (language) => {
  return `JSON_OBJECT('id', c.id,'name', ${
    language == constants.LANGUAGE_BN ? "c.name_bn" : "c.name"
  }) AS class_info,
JSON_OBJECT('id', g.id,'name', ${
    language == constants.LANGUAGE_BN ? "g.name_bn" : "g.name"
  }) AS group_info,
JSON_OBJECT('id', a.id,'name', ${
    language == constants.LANGUAGE_BN ? "a.name_bn" : "a.name"
  }) AS academic_year_info
FROM ${tName} as ${tObj}
LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON  ${tObj}.class_id = c.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON  ${tObj}.group_id = g.id
LEFT JOIN ${
    constants.ACADEMIC_YEAR_TABLE_NAME
  } as a ON  ${tObj}.academic_year_id = a.id`;
};
var parseRelationalDataToJson = (rows) => {
  // Format the results as JSON objects
  rows.forEach((element) => {
    // element["student_info"] = element.student_info != null ? JSON.parse(element.student_info) : [];
    // element["student_info"]=element.student_info != null?element.student_info.replace(/\"/g, ""):{};
    element["class_info"] =
      element.class_info != null ? JSON.parse(element.class_info) : {};
    element["group_info"] =
      element.group_id != null ? JSON.parse(element.group_info) : {};
    element["academic_year_info"] =
      element.academic_year_info != null
        ? JSON.parse(element.academic_year_info)
        : {};
  });
  return rows;
};
exports.allFields = [
  "id",
  "class_id",
  "group_id",
  "academic_year_id",
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
