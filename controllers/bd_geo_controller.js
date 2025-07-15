const express = require("express");
const configs = require("../config/config.json");
const constants = require("../utils/constants");
const statusCode = require("../utils/status_code");
const message = require("../utils/message");
const db = require("../config/mysqldb");

exports.getAllDivision = (req, res) => {
  const sql = `SELECT id,${req.headers.language==constants.LANGUAGE_BN?'bn_name':'name'} as name FROM ${constants.DIVISION_TABLE_NAME}`;

  db.query(sql, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: message.FAILED(req.headers.language),
        error: err,
      });
    }
    console.log(`.......language.........${req.headers.language}`);
    res.status(statusCode.STATUS_OK).json({
      message: message.SUCCESS(req.headers.language),
      data: rows,
    });
  });
};
exports.getAllDistrict = (req, res) => {
  const sql = `SELECT id,division_id,${req.headers.language==constants.LANGUAGE_BN?'bn_name':'name'} as name FROM ${constants.DISTRICT_TABLE_NAME}`;

  db.query(sql, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: message.FAILED(req.headers.language),
        error: err,
      });
    }
    res.status(statusCode.STATUS_OK).json({
      message:  message.SUCCESS(req.headers.language),
      data: rows,
    });
  });
  // districtSchema
  //   .find()
  //   .then((data) => {
  //     return res.status(201).json({
  //       data: data,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err.message);
  //     return res.status(401).json({
  //       message: "Failed ",
  //       err,
  //     });
  //   });
};
exports.getAllDistrictByDivId = (req, res) => {
  const sql = `SELECT id,division_id,${req.headers.language==constants.LANGUAGE_BN?'bn_name':'name'} as name FROM ${constants.DISTRICT_TABLE_NAME} WHERE division_id = ?`;

  db.query(sql, [req.params.id], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message:  message.FAILED(req.headers.language),
        error: err,
      });
    }
    if (rows.length > 0) {
      res.status(statusCode.STATUS_OK).json({
        message:  message.SUCCESS(req.headers.language),
        data: rows,
      });
    } else {
      res.status(statusCode.STATUS_NOT_FOUND).json({
        message:  message.NOT_FOUND(req.headers.language),
      });
    }
  });


  // districtSchema
  //   .find({ division_id: req.params.id })
  //   .then((data) => {
  //     return res.status(201).json({
  //       data: data,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err.message);
  //     return res.status(401).json({
  //       message: "Failed ",
  //       err,
  //     });
  //   });
};

exports.getAllUpazilla = (req, res) => {
  const sql = `SELECT id,district_id,${req.headers.language==constants.LANGUAGE_BN?'bn_name':'name'} as name FROM ${constants.UPAZILA_TABLE_NAME}`;

  db.query(sql, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: message.FAILED(req.headers.language),
        error: err,
      });
    }
    res.status(statusCode.STATUS_OK).json({
      message:  message.SUCCESS(req.headers.language),
      data: rows,
    });
  });
 
  // upazilaSchema
  //   .find()
  //   .then((data) => {
  //     return res.status(201).json({
  //       data: data,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err.message);
  //     return res.status(401).json({
  //       message: "Failed ",
  //       err,
  //     });
  //   });
};
exports.getAllUpazillaByDistId = (req, res) => {
  const sql = `SELECT id,district_id,${req.headers.language==constants.LANGUAGE_BN?'bn_name':'name'} as name FROM ${constants.UPAZILA_TABLE_NAME} WHERE district_id = ?`;

  db.query(sql, [req.params.id], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message:  message.FAILED(req.headers.language),
        error: err,
      });
    }
    if (rows.length > 0) {
      res.status(statusCode.STATUS_OK).json({
        message:  message.SUCCESS(req.headers.language),
        data: rows,
      });
    } else {
      res.status(statusCode.STATUS_NOT_FOUND).json({
        message:  message.NOT_FOUND(req.headers.language),
      });
    }
  });
  // upazilaSchema
  //   .find({ district_id: req.params.id })
  //   .then((data) => {
  //     return res.status(201).json({
  //       data: data,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err.message);
  //     return res.status(401).json({
  //       message: "Failed ",
  //       err,
  //     });
  //   });
};
exports.getAllUnion = (req, res) => {
  const sql = `SELECT id,upazilla_id,${req.headers.language==constants.LANGUAGE_BN?'bn_name':'name'} as name FROM ${constants.UNION_TABLE_NAME}`;

  db.query(sql, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message:  message.FAILED(req.headers.language),
        error: err,
      });
    }
    res.status(statusCode.STATUS_OK).json({
      message:  message.SUCCESS(req.headers.language),
      data: rows,
    });
  });
  // unionSchema
  //   .find()
  //   .then((data) => {
  //     return res.status(201).json({
  //       data: data,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err.message);
  //     return res.status(401).json({
  //       message: "Failed ",
  //       err,
  //     });
  //   });
};
exports.getAllUnionByUpazillaId = (req, res) => {
  const sql = `SELECT id,upazilla_id,${req.headers.language==constants.LANGUAGE_BN?'bn_name':'name'} as name FROM ${constants.UNION_TABLE_NAME} WHERE upazilla_id = ?`;

  db.query(sql, [req.params.id], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message:  message.FAILED(req.headers.language),
        error: err,
      });
    }
    if (rows.length > 0) {
      res.status(statusCode.STATUS_OK).json({
        message:  message.SUCCESS(req.headers.language),
        data: rows,
      });
    } else {
      res.status(statusCode.STATUS_NOT_FOUND).json({
        message:  message.NOT_FOUND(req.headers.language),
      });
    }
  });
  // unionSchema
  //   .find({ upazilla_id: req.params.id })
  //   .then((data) => {
  //     return res.status(201).json({
  //       data: data,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err.message);
  //     return res.status(401).json({
  //       message: "Failed ",
  //       err,
  //     });
  //   });
};
