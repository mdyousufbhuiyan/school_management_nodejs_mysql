const express = require("express");
const configs = require("../config/config.json");
const constants = require("../utils/constants");
const message = require("../utils/message");
const statusCode = require("../utils/status_code");
const db = require("../config/mysqldb");

exports.addAppLanguage = (req, res,next) => {
  const sql = `SELECT * FROM ${constants.APP_LANGUAGE_COLLECTION_NAME} WHERE name = ?`;

  db.query(sql, [req.body.name], (err, rows, fields) => {
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
        `INSERT INTO ${constants.APP_LANGUAGE_COLLECTION_NAME} SET ?`,
        req.body,
        (err, rows, fields) => {
          if (err instanceof Error) {
            console.log(err);
            return res.status(statusCode.STATUS_BAD_REQUEST).json({
              message: message.FAILED(req.headers.language),
              error: err,
            });
          } else if (rows) {
            // res.status(statusCode.STATUS_CREATED).json({
            //   message: message.SUCCESS(req.headers.language),
            //   data: rows,
            // });
            next();
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
exports.getAllAppLanguages = (req, res) => {
  var language = req.headers.language;
  //console.log(`..........language..........>${language}`);
  //const sql = `SELECT c.id,${language=='BN' ?'c.name_bn': 'c.name'} as name,c.created_at,c.updated_at FROM ${constants.CLASS_NAME_TABLE} as c`;
  const sql = `SELECT * FROM ${constants.APP_LANGUAGE_COLLECTION_NAME}`;

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

exports.updateAppLanguages = (req, res,next) => {
     // Construct the final UPDATE query string
     const query = `UPDATE ${constants.APP_LANGUAGE_COLLECTION_NAME} SET value_en = ? , value_bn = ? WHERE id = ?`;

     // Execute the query
     db.query(
       query,
       [req.body.value_en, req.body.value_bn, req.params.id],
       (err, result) => {
         if (err) {
           return res.status(statusCode.STATUS_BAD_REQUEST).json({ error: err.message });
         }

         // Check if any row was updated
         if (result.affectedRows === 0) {
           return res.status(statusCode.STATUS_BAD_REQUEST).json({ message: message.NOT_FOUND(req.headers.language) });
         }

         // Return a success response
        //  res.status(statusCode.STATUS_OK).json({
        //    message: message.UPDATED_SUCCESSFULLY(req.headers.language),
        //    data: result.affectedRows,
        //  });
        next();
       }
     );
};

var parseRelationalDataToJson = (rows) => {
  // Format the results as JSON objects
  rows.forEach((element) => {
    //element["group_info"] = element['group_id']!=null?JSON.parse(element.group_info):{};
  });
  return rows;
};
