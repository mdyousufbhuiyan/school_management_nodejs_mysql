const express = require("express");
const configs = require("../config/config.json");
const constants = require("../utils/constants");
const message = require("../utils/message");
const statusCode = require("../utils/status_code");
const db = require("../config/mysqldb");

exports.addClasses = (req, res) => {
  console.log(`......name............${req.body.name}`);
  const sql = `SELECT * FROM ${constants.CLASS_NAME_TABLE} WHERE name = ? OR name_bn = ?`;

  db.query(sql, [req.body.name, req.body.name_bn], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: message.FAILED(req.headers.language),
        err,
      });
    }
    if (rows.length > 0) {
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: message.ALREADY_EXISTS(req.headers.language),
      });
    } else {
      db.query(
        `INSERT INTO ${constants.CLASS_NAME_TABLE} SET ?`,
        req.body,
        (err, rows, fields) => {
          if (err instanceof Error) {
            console.log(err);
            return res.status(statusCode.STATUS_BAD_REQUEST).json({
              message: message.FAILED(req.headers.language),
              error: err,
            });
          } else if (rows) {
            res.status(statusCode.STATUS_CREATED).json({
              message: message.SUCCESS(req.headers.language),
              data: rows,
            });
          } else {
            console.log(rows);
            return res.status(statusCode.STATUS_BAD_REQUEST).json({
              message: message.FAILED(req.headers.language),
              data: rows,
            });
          }
        }
      );
    }
  });
};
exports.getClassByClassId = (req, res) => {
  // const sql = `SELECT * FROM ${constants.CLASS_NAME_TABLE} WHERE id = ?`;
  const sql = `SELECT c.id,c.name,c.group_id,c.created_at,c.updated_at, JSON_OBJECT('id', g.id,'name', g.name,'name_bn', g.bn_name) AS group_info FROM ${constants.CLASS_NAME_TABLE} as c LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON c.group_id = g.id WHERE c.id = ?`;

  db.query(sql, [req.params.id], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(401).json({
        message: message.FAILED(req.headers.language),
        err,
      });
    }
    if (rows.length > 0) {
      res.status(statusCode.STATUS_OK).json({
        message: message.SUCCESS(req.headers.language),
        data: parseRelationalDataToJson(rows)[0],
      });
    } else {
      res.status(statusCode.STATUS_NOT_FOUND).json({
        message: message.NOT_FOUND(req.headers.language),
      });
    }
  });
};

exports.getAllClasses = (req, res) => {
  var language = req.headers.language;
  //console.log(`..........language..........>${language}`);
  //const sql = `SELECT c.id,${language=='BN' ?'c.name_bn': 'c.name'} as name,c.created_at,c.updated_at FROM ${constants.CLASS_NAME_TABLE} as c`;
  const sql = `SELECT c.id, c.name,c.name_bn,c.created_at,c.updated_at FROM ${constants.CLASS_NAME_TABLE} as c`;

  db.query(sql, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: message.FAILED(req.headers.language),
        err,
      });
    }
    res.status(statusCode.STATUS_OK).json({
      message: message.SUCCESS(req.headers.language),
      data: parseRelationalDataToJson(rows),
    });
  });
};

exports.getAllClassesForDropdown = (req, res) => {
  var language = req.headers.language;
  const sql = `SELECT id,${language==constants.LANGUAGE_BN?'name_bn':'name'} as name FROM ${constants.CLASS_NAME_TABLE}`;

  db.query(sql, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: message.FAILED(req.headers.language),
        err,
      });
    }
    res.status(statusCode.STATUS_OK).json({
      data: rows,
    });
  });
};

exports.updateClasses = (req, res) => {
  const sql = `SELECT * FROM ${constants.CLASS_NAME_TABLE} WHERE id != ? AND name = ? AND name_bn = ?`;

  db.query(
    sql,
    [req.params.id, req.body.name, req.body.name_bn],
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
        // Construct the final UPDATE query string
        const query = `UPDATE ${constants.CLASS_NAME_TABLE} SET name = ? , name_bn = ? WHERE id = ?`;

        // Execute the query
        db.query(
          query,
          [req.body.name, req.body.name_bn, req.params.id],
          (err, result) => {
            if (err) {
              return res.status(statusCode.STATUS_BAD_REQUEST).json({ error: err.message });
            }

            // Check if any row was updated
            if (result.affectedRows === 0) {
              return res.status(statusCode.STATUS_BAD_REQUEST).json({ message: message.NOT_FOUND(req.headers.language) });
            }

            // Return a success response
            res.status(statusCode.STATUS_OK).json({
              message: message.UPDATED_SUCCESSFULLY(req.headers.language),
              data: result.affectedRows,
            });
          }
        );
      }
    }
  );
};

//delete
exports.deleteClass = (req, res) => {
  const id = req.params.id; // Get the ID from the request parameters

  // SQL query to delete the record from the database
  const sql = `DELETE FROM ${constants.CLASS_NAME_TABLE} WHERE id = ?`;

  // Execute the SQL query
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting User:", err);
      return res
        .status(statusCode.STATUS_BAD_REQUEST)
        .json({ message: message.FAILED_TO_DELETE(req.headers.language), error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(statusCode.STATUS_BAD_REQUEST).json({ message: message.FAILED(req.headers.language) });
    }

    // If the record is deleted successfully
    return res.status(statusCode.STATUS_OK).json({ message: message.DELETED_SUCCESSFULLY(req.headers.language) });
  });
};
var parseRelationalDataToJson = (rows) => {
  // Format the results as JSON objects
  rows.forEach((element) => {
    //element["group_info"] = element['group_id']!=null?JSON.parse(element.group_info):{};
  });
  return rows;
};
