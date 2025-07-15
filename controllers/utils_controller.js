const express = require("express");
const configs = require("../config/config.json");
const constants = require("../utils/constants");
const statusCode = require("../utils/status_code");
const staticMessage = require("../utils/message");
const db = require("../config/mysqldb");

exports.getAllDurations = (req, res) => {
  const sql = `SELECT id,${req.headers.language==constants.LANGUAGE_BN?'name_bn':'name'} as name FROM ${constants.DURATION_TABLE_NAME} ORDER BY priority ASC`;

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

exports.getAllLanguageas = (req, res) => {
  const sql = `SELECT * FROM ${constants.APP_LANGUAGE_COLLECTION_NAME}`;

  db.query(sql, (err, results, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }

    // Create a dictionary (object) from the query result
    const dictionary = results.reduce((acc, row) => {
      // acc[row.title] = {
      //   name:req.params.language=='bn'? row.value_bn:row.value_en, 
      // };
      acc[row.name] = req.headers.language=='BN'? row.value_bn:row.value_en;
    
      return acc;
    }, {});

    // Output the dictionary
    // console.log(dictionary);

    res.status(statusCode.STATUS_OK).json({
      message:staticMessage.SUCCESS(req.headers.language),
      data: dictionary,
    });
  });
};
