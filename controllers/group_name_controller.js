const express = require("express");
const constants = require("../utils/constants");
const statusCode = require("../utils/status_code");
const db = require("../config/mysqldb");
const message = require("../utils/message");
exports.getGroupNameById = (req, res) => {
  const sql = `SELECT * FROM ${constants.GROUP_NAME_TABLE_NAME} WHERE id = ?`;

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

exports.getAllGroupName = (req, res) => {
  const sql = `SELECT id,${req.headers.language==constants.LANGUAGE_BN?'name_bn':'name'} as name FROM ${constants.GROUP_NAME_TABLE_NAME}`;

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
