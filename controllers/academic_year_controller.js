const express = require("express");
const configs = require("../config/config.json");
const constants = require("../utils/constants");
const statusCode = require("../utils/status_code");
const message = require("../utils/message");
const db = require("../config/mysqldb");

exports.addAcademicYear = (req, res) => {
  console.log(`......name............${req.body.name}`);
  const sql = `SELECT * FROM ${constants.ACADEMIC_YEAR_TABLE_NAME} WHERE name = ?`;

  db.query(sql, [req.body.name], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: "Failed",
        err,
      });
    }
    if (rows.length > 0) {
      console.log(rows);
      return res.status(statusCode.STATUS_CONFLICT).json({
        message: "Already Exists",
      });
    } else {
      db.query(
        `INSERT INTO ${constants.ACADEMIC_YEAR_TABLE_NAME} SET ?`,
        req.body,
        (err, rows, fields) => {
          if (err instanceof Error) {
            console.log(err);
            return res.status(statusCode.STATUS_BAD_REQUEST).json({
              message: "Failed",
              error: err,
            });
          } else {
            res.status(statusCode.STATUS_CREATED).json({
              message: "Success",
              data: rows,
            });
          }
        }
      );
    }
  });
};
exports.getAcademicYearById = (req, res) => {
  const sql = `SELECT * FROM ${constants.ACADEMIC_YEAR_TABLE_NAME} WHERE id = ?`;

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

exports.getAllAcademicYear = (req, res) => {
  const sql = `SELECT id,${req.headers.language==constants.LANGUAGE_BN?'name_bn':'name'} as name FROM ${constants.ACADEMIC_YEAR_TABLE_NAME} ORDER BY name DESC`;

  db.query(sql, (err, rows, fields) => {
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
exports.updateAcademicYear = (req, res) => {

  const sql = `SELECT * FROM ${constants.ACADEMIC_YEAR_TABLE_NAME} WHERE id != ? AND name = ?`;
  
  db.query(sql, [req.params.id, req.body.name], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: "Failed",
        error: err,
      });
    }

    if (rows.length > 0) {
      console.log(rows);
      return res.status(statusCode.STATUS_CONFLICT).json({
        message: "Already Exists",
      });
    } else {
      // Construct the final UPDATE query string
      const query = `UPDATE ${constants.ACADEMIC_YEAR_TABLE_NAME} SET name = ? WHERE id = ?`;

      // Execute the query
      db.query(query, [req.body.name,req.params.id], (err, result) => {
        if (err) {
          return res.status(statusCode.STATUS_BAD_REQUEST).json({ 
            message: "Failed",
            error: err });
        }

        // Check if any row was updated
        if (result.affectedRows === 0) {
          return res.status(statusCode.STATUS_NOT_FOUND).json({ message: "Not found" });
        }

        // Return a success response
        res.status(statusCode.STATUS_OK).json({
          message: "Updated successfully",
          data: result.affectedRows,
        });
      });
    }
  });
};

//delete
exports.deleteAcademicYear = (req, res) => {
  
  const id = req.params.id; // Get the ID from the request parameters

  // SQL query to delete the record from the database
  const sql = `DELETE FROM ${constants.ACADEMIC_YEAR_TABLE_NAME} WHERE id = ?`;

  // Execute the SQL query
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting User:', err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({ message: 'Failed to delete item', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(statusCode.STATUS_NOT_FOUND).json({ message: 'Not found' });
    }

    // If the record is deleted successfully
    return res.status(statusCode.STATUS_OK).json({ message: 'Deleted successfully' });
  });
};
