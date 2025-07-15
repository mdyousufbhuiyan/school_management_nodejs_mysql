const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const configs = require("../config/config.json");
const constants = require("../utils/constants");
const mysqldb = require("../config/mysqldb");

exports.loginController = async (req, res) => {
  console.log(`user name ${req.body.username}`);
  const sql = `SELECT * FROM ${constants.USER_TYPE_ADMIN} WHERE user_id = ?`;
  mysqldb.query(sql, [req.body.username], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(401).json({
        message: "Failed",
      });
    } else if (rows.length < 1) {
      return res.status(401).json({
        message: "UserId not found",
      });
    } else if (
      rows &&
      bcrypt.compareSync(req.body.password, rows[0].password)
    ) {
      //       //correct password
      const JWT_KEY = configs.JWT_KEY;
      const token = jwt.sign(
        {
          user_type: rows[0].user_type,
          user_id: rows[0].user_id,
        },
        JWT_KEY,
        {
          expiresIn: "1000h",
        }
      );
      console.log(`token.........${token}`);
      const sql = `UPDATE admin SET token = ? WHERE id = ?`;
      mysqldb.query(sql, [token, rows[0]["id"]], (err, result) => {
        console.log(`........update response.........${result}`);

        if (err instanceof Error) {
          console.log(err);
          return res.status(401).json({
            message: "Failed",
          });
        } else {
          const sql = `SELECT id,token,user_id,user_type,profile,email,nid,first_name,middle_name,last_name,gender,dob,phone,is_single_attendance_for_all,is_active,created_at,updated_at FROM ${constants.USER_TYPE_ADMIN} WHERE user_id = ?`;
          mysqldb.query(sql, [req.body.username], (err, rows, fields) => {
            res.status(200).json({
              message: "Login Success",
             ...rows[0],
            });
          });
        }
      });
    } else {
      return res.status(401).json({
        message: "wrong password",
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
