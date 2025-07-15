const express = require("express");
const configs = require("../config/config.json");
const constants = require("../utils/constants");
const statusCode = require("../utils/status_code");
const staticMessage = require("../utils/message");
const db = require("../config/mysqldb");
const tName = constants.FEE_TYPE_TABLE_NAME;
exports.addFeeType = (req, res) => {
  console.log(`......name............${req.body.name}`);
  const sql = `SELECT * FROM ${tName} WHERE name = ?`;

  db.query(sql, [req.body.name], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message:staticMessage.FAILED(req.headers.language),
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
  });
};

exports.getAllFeeTypes = (req, res) => {
  const sql = `SELECT * FROM ${tName} ORDER BY name`;

  db.query(sql, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: rows,
    });
  });
};

exports.getAllFeeTypesForDropdown = (req, res) => {
  var sql;
  
    sql = `SELECT id,${req.headers.language==constants.LANGUAGE_BN?'name_bn':'name'} as name FROM ${tName} ORDER BY name`;

  db.query(sql, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    res.status(statusCode.STATUS_OK).json({
      message: staticMessage.SUCCESS(req.headers.language),
      data: rows,
    });
  });
};

exports.getFeeTypeById = (req, res) => {
  const sql = `SELECT * FROM ${tName} WHERE id = ?`;

  db.query(sql, [req.params.id], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: "Failed",
        error: err,
      });
    }
    if (rows.length > 0) {
      res.status(statusCode.STATUS_OK).json({
        message: "Success",
        data: rows[0],
      });
    } else {
      res.status(statusCode.STATUS_NOT_FOUND).json({
        message: "Not Found",
      });
    }
  });
};

exports.updateFeeType = (req, res) => {
  const sql = `SELECT * FROM ${tName} WHERE id != ? AND name = ?`;

  db.query(sql, [req.params.id, req.body.name], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }

    if (rows.length > 0) {
      console.log(rows);
      return res.status(statusCode.STATUS_CONFLICT).json({
        message: staticMessage.ALREADY_EXISTS(req.headers.language),
      });
    } else {
      // Construct the final UPDATE query string
      const query = `UPDATE ${tName} SET name = ?,name_bn = ? WHERE id = ?`;

      // Execute the query
      db.query(
        query,
        [req.body.name,req.body.name_bn, req.params.id],
        (err, result) => {
          if (err) {
            return res.status(statusCode.STATUS_BAD_REQUEST).json({
              message: staticMessage.FAILED(req.headers.language),
              error: err,
            });
          }

          // Check if any row was updated
          if (result.affectedRows === 0) {
            return res
              .status(statusCode.STATUS_NOT_FOUND)
              .json({ message: staticMessage.NOT_FOUND(req.headers.language) });
          }

          // Return a success response
          res.status(statusCode.STATUS_OK).json({
            message: staticMessage.UPDATED_SUCCESSFULLY(req.headers.language),
            data: result.affectedRows,
          });
        }
      );
    }
  });
};

//delete
exports.deleteFeeType = (req, res) => {
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
