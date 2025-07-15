const express = require("express");
const configs = require("../config/config.json");
const constants = require("../utils/constants");
const message = require("../utils/message");
const statusCode = require("../utils/status_code");
const db = require("../config/mysqldb");

exports.addSubsects = (req, res) => {
  console.log(`......name............${req.body.name}`);
  const sql = `SELECT * FROM ${constants.SUBJECT_NAME_TABLE} WHERE name = ?`;

  db.query(sql, [req.body.name], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message:message.FAILED(req.headers.language),
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
        `INSERT INTO ${constants.SUBJECT_NAME_TABLE} SET ?`,
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
  });
};

exports.getAllSubjects = (req, res) => {
  const sql = `SELECT * FROM ${constants.SUBJECT_NAME_TABLE} WHERE name != ? ORDER BY subject_code`;

  db.query(sql, ["all"], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: message.FAILED(req.headers.language),
        error: err,
      });
    }
    res.status(statusCode.STATUS_OK).json({
      message:message.SUCCESS(req.headers.language),
      data: rows,
    });
  });
};

exports.getAllSubjectsForDropdown = (req, res) => {
  var language = req.headers.language;
  var sql;
  var condition = [];
  if (String(req.query.is_all_require)==='false') {
    sql = `SELECT id,${language==constants.LANGUAGE_BN?'name_bn':'name'} as name,subject_code FROM ${constants.SUBJECT_NAME_TABLE} WHERE name != ? ORDER BY subject_code`;
    condition = ["all"];

  } else {
    sql = `SELECT id,${language==constants.LANGUAGE_BN?'name_bn':'name'} as name,subject_code FROM ${constants.SUBJECT_NAME_TABLE} ORDER BY subject_code`;
    condition = [];
  }
 console.log(
   `.........req.query.is_all_require...${req.query.is_all_require}...sql.....${sql}`
 );
  db.query(sql, [condition], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: message.FAILED(req.headers.language),
        error: err,
      });
    }
    res.status(statusCode.STATUS_OK).json({
      message: message.SUCCESS(req.headers.language),
      data: rows,
    });
  });
};

exports.getSubjectById = (req, res) => {
  const sql = `SELECT * FROM ${constants.SUBJECT_NAME_TABLE} WHERE id = ?`;

  db.query(sql, [req.params.id], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message:message.FAILED(req.headers.language),
        error: err,
      });
    }
    if (rows.length > 0) {
      res.status(statusCode.STATUS_OK).json({
        message: message.SUCCESS(req.headers.language),
        data: rows[0],
      });
    } else {
      res.status(statusCode.STATUS_NOT_FOUND).json({
        message: message.NOT_FOUND(req.headers.language),
      });
    }
  });
};

exports.updateSubjects = (req, res) => {
  const sql = `SELECT * FROM ${constants.SUBJECT_NAME_TABLE} WHERE id != ? AND name = ?`;

  db.query(sql, [req.params.id, req.body.name], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: message.FAILED(req.headers.language),
        error: err,
      });
    }

    if (rows.length > 0) {
      console.log(rows);
      return res.status(statusCode.STATUS_CONFLICT).json({
        message: message.ALREADY_EXISTS(req.headers.language),
      });
    } else {
      // Construct the final UPDATE query string
      const query = `UPDATE ${constants.SUBJECT_NAME_TABLE} SET name = ?,name_bn = ?,subject_code = ? WHERE id = ?`;

      // Execute the query
      db.query(
        query,
        [req.body.name, req.body.name_bn, req.body.subject_code, req.params.id],
        (err, result) => {
          if (err) {
            return res.status(statusCode.STATUS_BAD_REQUEST).json({
              message: message.FAILED(req.headers.language),
              error: err,
            });
          }

          // Check if any row was updated
          if (result.affectedRows === 0) {
            return res
              .status(statusCode.STATUS_NOT_FOUND)
              .json({ message: message.NOT_FOUND(req.headers.language) });
          }

          // Return a success response
          res.status(statusCode.STATUS_OK).json({
            message: message.UPDATED_SUCCESSFULLY(req.headers.language),
            data: result.affectedRows,
          });
        }
      );
    }
  });
};

//delete
exports.deleteSubjects = (req, res) => {
  const id = req.params.id; // Get the ID from the request parameters

  // SQL query to delete the record from the database
  const sql = `DELETE FROM ${constants.SUBJECT_NAME_TABLE} WHERE id = ?`;

  // Execute the SQL query
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting User:", err);
      return res
        .status(statusCode.STATUS_BAD_REQUEST)
        .json({ message: message.FAILED_TO_DELETE(req.headers.language), error: err });
    }

    if (result.affectedRows === 0) {
      return res
        .status(statusCode.STATUS_NOT_FOUND)
        .json({ message: message.NOT_FOUND(req.headers.language) });
    }

    // If the record is deleted successfully
    return res
      .status(statusCode.STATUS_OK)
      .json({ message: message.DELETED_SUCCESSFULLY(req.headers.language) });
  });
};
