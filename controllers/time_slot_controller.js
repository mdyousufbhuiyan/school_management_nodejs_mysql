const express = require("express");
const constants = require('../utils/constants');
const statusCode = require("../utils/status_code");
const staticMessage = require("../utils/message");
const db = require("../config/mysqldb");

exports.addTimeSlot = (req, res) => {
  console.log(`......name............${req.body.start_time}`);
  const sql = `SELECT * FROM ${constants.TIME_SLOT_TABLE} WHERE start_time = ? AND end_time = ?`;

  db.query(sql, [req.body.start_time,req.body.end_time], (err, rows, fields) => {
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
        `INSERT INTO ${constants.TIME_SLOT_TABLE} SET ?`,
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
exports.getTimeSlotById = (req, res) => {
  const sql = `SELECT * FROM ${constants.TIME_SLOT_TABLE} WHERE id = ?`;

  db.query(sql, [req.params.id], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    if (rows.length > 0) {
      res.status(statusCode.STATUS_OK).json({
        message: staticMessage.SUCCESS(req.headers.language),
        data: rows[0],
      });
    } else {
      res.status(statusCode.STATUS_NOT_FOUND).json({
        message: staticMessage.NOT_FOUND(req.headers.language),
      });
    }
  });
};

exports.getAllTimeSlot = (req, res) => {
  const sql = `SELECT * FROM ${constants.TIME_SLOT_TABLE}`;

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
exports.getAllTimeSlotOnlyDropdown = (req, res) => {
  const sql = `SELECT id,start_time,end_time FROM ${constants.TIME_SLOT_TABLE}`;

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
//update
exports.updateTimeSlot = (req, res) => {

  const sql = `SELECT * FROM ${constants.TIME_SLOT_TABLE} WHERE id != ? AND start_time = ? AND end_time = ?`;
  
  db.query(sql, [req.params.id, req.body.start_time, req.body.end_time], (err, rows, fields) => {
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
      const query = `UPDATE ${constants.TIME_SLOT_TABLE} SET start_time = ?,end_time = ? WHERE id = ?`;

      // Execute the query
      db.query(query, [req.body.start_time,req.body.end_time, req.params.id], (err, result) => {
        if (err) {
          return res.status(statusCode.STATUS_BAD_REQUEST).json({ 
            message: staticMessage.FAILED(req.headers.language),
            error: err });
        }

        // Check if any row was updated
        if (result.affectedRows === 0) {
          return res.status(statusCode.STATUS_NOT_FOUND).json({ message: "Not found" });
        }

        // Return a success response
        res.status(statusCode.STATUS_OK).json({
          message: staticMessage.UPDATED_SUCCESSFULLY(req.headers.language),
          data: result.affectedRows,
        });
      });
    }
  });
};

//delete
exports.deleteTimeSlot = (req, res) => {
  
  const id = req.params.id; // Get the ID from the request parameters

  // SQL query to delete the record from the database
  const sql = `DELETE FROM ${constants.TIME_SLOT_TABLE} WHERE id = ?`;

  // Execute the SQL query
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting User:', err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({ message: staticMessage.FAILED_TO_DELETE(req.headers.language), error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(statusCode.STATUS_NOT_FOUND).json({ message: staticMessage.NOT_FOUND(req.headers.language) });
    }

    // If the record is deleted successfully
    return res.status(statusCode.STATUS_OK).json({ message: staticMessage.DELETED_SUCCESSFULLY(req.headers.language) });
  });
};


