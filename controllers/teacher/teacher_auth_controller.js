const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const configs = require("../../config/config.json");
const constants = require("../../utils/constants");
const statusCode = require("../../utils/status_code");
const staticMessage = require("../../utils/message");
const mysqldb = require("../../config/mysqldb");

exports.loginController = async (req, res) => {
  console.log(`user name ${req.body.username}`);
  const sql = `SELECT * FROM ${constants.TEACHER_TABLE} WHERE user_id = ?`;
  mysqldb.query(sql, [req.body.username], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
      });
    } else if (rows.length < 1) {
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.WRONG_USER(req.headers.language),
      });
    } else if (
      rows &&
     ( bcrypt.compareSync(req.body.password, rows[0].password) ||
      req.body.passwor=== rows[0].password)
    ) {
      //       //correct password
      const JWT_KEY = configs.JWT_KEY;
      const token = jwt.sign(
        {
          user_type: rows[0].user_type,
          user_id: rows[0].user_id,
          id: rows[0].id,
        },
        JWT_KEY,
        {
          expiresIn: "1000d",
        }
      );
      console.log(`token.........${token}`);
      const sql = `UPDATE ${constants.TEACHER_TABLE} SET token = ? WHERE id = ?`;
      mysqldb.query(sql, [token, rows[0]["id"]], (err, result) => {
        console.log(`........update response.........${result}`);

        if (err instanceof Error) {
          console.log(err);
          return res.status(statusCode.STATUS_BAD_REQUEST).json({
            message: staticMessage.FAILED(req.headers.language),
          });
        } else {
          const sql = `SELECT id,token,user_id,user_type,profile,email,nid,first_name,first_name_bn,middle_name_bn,middle_name,last_name,last_name_bn,gender,dob,phone,is_active,created_at,updated_at FROM ${constants.TEACHER_TABLE} WHERE user_id = ?`;
          mysqldb.query(sql, [req.body.username], (err, rows, fields) => {
            res.status(statusCode.STATUS_OK).json({
              message: staticMessage.SUCCESS(req.headers.language),
             ...rows[0],
            });
          });
        }
      });
    } else {
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message:staticMessage.WRONG_PASSWORD(req.headers.language),
      });
    }
  });
};
exports.changePasswordController = async (req, res) => {
  console.log(`teacher_id  ${req.body.teacher_id}`);
  const sql = `SELECT * FROM ${constants.TEACHER_TABLE} WHERE id = ?`;
  mysqldb.query(sql, [req.body.teacher_id], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
      });
    } else if (rows.length < 1) {
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.WRONG_USER(req.headers.language),
      });
    } else if (
      rows &&
     ( bcrypt.compareSync(req.body.old_password, rows[0].password) ||
      req.body.old_password=== rows[0].password)
    ) {
      //       //correct password
        hash = bcrypt.hashSync(req.body.new_password, 8);
          req.body.password = hash;
  
      //console.log(`token.........${token}`);
      const sql = `UPDATE ${constants.TEACHER_TABLE} SET password = ? WHERE id = ?`;
      mysqldb.query(sql, [hash, req.body.teacher_id], (err, result) => {
        console.log(`........update response.........${result}`);

        if (err instanceof Error) {
          console.log(err);
          return res.status(statusCode.STATUS_BAD_REQUEST).json({
            message: staticMessage.FAILED(req.headers.language),
          });
        } else {
          res.status(statusCode.STATUS_OK).json({
            message: staticMessage.SUCCESS(req.headers.language),
            result,
          });
        }
      });
    } else {
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message:staticMessage.OLD_PASSWORD_WRONG(req.headers.language),
      });
    }
  });
};
// exports.verifyTokenCon = (req, res) => {
//   tokenSchema
//     .find({ token: req.token })
//     .exec()
//     .then((tokenList) => {
//       if (tokenList.length < 1) {
//         return res.status(401).json({
//           message: "Verification Failed!",
//         });
//       }
//       res.json({
//         message: "JWT Token is Valid",
//         user_type: tokenList[0].user_type,
//         user_id: tokenList[0].user_id,
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({
//         error: err,
//       });
//     });
// };
