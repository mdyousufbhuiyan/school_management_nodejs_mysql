const configs = require("../config/config.json");
const constants = require("../utils/constants");
const db = require("../config/mysqldb");
const statusCode = require("../utils/status_code");
const staticMessage = require("../utils/message");
const tName = constants.HOLIDDAY_COLLECTION_NAME;
const tObj = "hd";

exports.addHoliday = (req, res) => {
  const sql = `SELECT * FROM ${tName} WHERE title_en = ? OR title_bn = ? `;
  db.query(
    sql,
    [req.body.title_en, req.body.title_bn],
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
exports.getAllHoliday = (req, res) => {
  var conditions = "";
  var queryList = [];
  // if (req.query.class_id != null) {
  //   conditions += `${tObj}.class_id = ?`;
  //   queryList.push(req.query.class_id);
  // }

  if (req.query.academic_year_id != null) {
    conditions += `${tObj}.academic_year_id = ?`;
    queryList.push(req.query.academic_year_id);
  }

  // if (req.query.from_date != null) {
  //   conditions += `${
  //     conditions.length > 0 ? "AND " : ""
  //   } ${tObj}.from_date = ?`;
  //   queryList.push(req.query.holiday_date);
  // }
  if (req.query.from_date != null && req.query.to_date != null) {
    conditions += `${
      conditions.length > 0 ? "AND " : ""
    } ${tObj}.from_date BETWEEN ? AND ?`;
    queryList.push(req.query.from_date);
    queryList.push(req.query.to_date);
  }
  console.log(`........conditions........${conditions}.....${queryList}`);
  var sql;

  if (queryList.length > 0) {
   // ${getRelationalQuery} WHERE ${conditions} OR ${tObj}.from_date IS NULL ORDER BY ${tObj}.from_date ASC`;
    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery} WHERE ${conditions} ORDER BY ${tObj}.from_date ASC`;
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
  ${getRelationalQuery} ORDER BY ${tObj}.from_date ASC`;
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
exports.getLatestAcademicYear = (req, res, next) => {
  console.log(
    `.........req.query.academic_year_id.............${req.query.academic_year_id}`
  );
  if (req.query.academic_year_id != null && req.query.academic_year_id != "") {
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
      console.log(rows);
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
exports.getParticularMonthHoliday = (req, res) => {
  console.log(`........req.query.academic_year_id........${req.query.academic_year_id}...req.query.month..${req.query.month}`);
  var sql;

    sql = `SELECT 
  ${this.selectedFields(tObj)},
  ${getRelationalQuery} WHERE (${tObj}.academic_year_id = ?) AND  (MONTH(${tObj}.from_date) = ? OR ${tObj}.holiday_type = ?)`;
    db.query(sql, [req.query.academic_year_id,req.query.month,'weekend'], (err, rows, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: staticMessage.FAILED(req.headers.language),
          error: err,
        });
      }
        console.log(rows);
      return res.status(statusCode.STATUS_OK).json({
        message: staticMessage.SUCCESS(req.headers.language),
        data: parseRelationalDataToJson(rows),
      });
    });

};
exports.getHolidayById = (req, res) => {
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
exports.updateHoliday = (req, res) => {
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
  const query = `UPDATE ${tName} SET ${setClause.join(
    ", "
  )} WHERE id = ?`;
  // Execute the query
  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(statusCode.STATUS_BAD_REQUEST).json({ error: err.message });
    }

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: staticMessage.NOT_FOUND(req.headers.language) });
    }

    // Return a success response
    res.status(statusCode.STATUS_OK).json({
      message: staticMessage.UPDATED_SUCCESSFULLY(req.headers.language),
      data: result.affectedRows,
    });
  });
};

//delete
exports.deleteHoliday = (req, res) => {
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
   element["academic_year_info"] =
      element.academic_year_info != null
        ? JSON.parse(element.academic_year_info)
        : {};
  });
  return rows;
};
var getRelationalQuery = `
JSON_OBJECT('id', a.id,'name', a.name) AS academic_year_info
FROM ${tName} as ${tObj}
LEFT JOIN ${constants.ACADEMIC_YEAR_TABLE_NAME} as a ON ${tObj}.academic_year_id = a.id`;

//JSON_CONTAINS(att.student_ids, JSON_ARRAY(st.id))
//FIND_IN_SET(p.product_id, u.product_ids) > 0
exports.allFields = [
  "id",
  "academic_year_id",
  "holiday_type",
  "from_date",
  "to_date",
  "holiday_day",
  "title_en",
  "title_bn",
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
