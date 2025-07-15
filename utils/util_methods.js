const jwt = require("jsonwebtoken");
const fs = require("fs");
const configs = require("../config/config.json");
const mysqldb = require("../config/mysqldb");
const constants = require("../utils/constants");
const { GoogleAuth } = require("google-auth-library");
const axios = require("axios");
const serviceAccountPath = "./utils/student-care-cce2f-firebase-adminsdk-fbsvc-a399345ac4.json";



exports.extractToken = async (req, res, next) => {
  // console.log(`......extractToken..req............${req.body}`);
  try {
    const token = req.headers.authorization.split(" ")[1]; // Get the token from the Authorization header

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, configs.JWT_KEY, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token has expired" });
        } else {
          return res.status(401).json({ message: "Invalid token" });
        }
      }

      // If the token is valid, save the decoded user data to request object
      const { user_id, user_type } = decoded;
      req.token = token;
      req.user_id = user_id;
      req.user_type = user_type;
      // console.log("..........decode..user_type....." + user_type);
      // console.log("..........decode..user_id....." + user_id);
      const sql = `SELECT * FROM ${constants.USER_TYPE_ADMIN}  WHERE user_id = ? AND token = ?`;
      //const sql = `SELECT * FROM ${constants.USER_TYPE_ADMIN}  WHERE user_id = ?`;
      mysqldb.query(sql, [user_id, req.token], (err, rows, fields) => {
        if (err instanceof Error) {
          res.status(404).json({ message: "Access not allow" });
          return;
        } else if (rows.length < 1) {
          return res.status(401).json({
            message: "Invalid Token",
          });
        } else {
          console.log(
            `.....error.........${err}...........rows......${rows[0]}`
          );
          next();
        }
      });
    });
  } catch (err) {
    res.status(401).json({
      message: "Session expired!",
      err,
    });
  }
};

exports.extractStudentToken = async (req, res, next) => {
  // console.log(`......extractToken..req............${req.body}`);
  try {
    const token = req.headers.authorization.split(" ")[1]; // Get the token from the Authorization header

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, configs.JWT_KEY, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token has expired" });
        } else {
          return res.status(401).json({ message: "Invalid token" });
        }
      }

      // If the token is valid, save the decoded user data to request object
      const { id, user_id, user_type } = decoded;
      req.token = token;
      req.user_id = user_id;
      req.user_type = user_type;
      req.id = id;
      // console.log("..........decode..user_type....." + user_type);
      // console.log("..........decode..user_id....." + user_id);
      const sql = `SELECT * FROM ${constants.STUDENT_TABLE}  WHERE id = ? AND token = ?`;
      //const sql = `SELECT * FROM ${constants.USER_TYPE_ADMIN}  WHERE user_id = ?`;
      mysqldb.query(sql, [req.id, req.token], (err, rows, fields) => {
        if (err instanceof Error) {
          res.status(404).json({ message: "Access not allow" });
          return;
        } else if (rows.length < 1) {
          return res.status(401).json({
            message: "Invalid Token",
          });
        } else {
          console.log(
            `.....error.........${err}...........rows......${rows[0]}`
          );
          next();
        }
      });
    });
  } catch (err) {
    res.status(401).json({
      message: "Session expired!",
      err,
    });
  }
};
exports.extractTeacherToken = async (req, res, next) => {
  // console.log(`......extractToken..req............${req.body}`);
  try {
    const token = req.headers.authorization.split(" ")[1]; // Get the token from the Authorization header

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, configs.JWT_KEY, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token has expired" });
        } else {
          return res.status(401).json({ message: "Invalid token" });
        }
      }

      // If the token is valid, save the decoded user data to request object
      const { id, user_id, user_type } = decoded;
      req.token = token;
      req.user_id = user_id;
      req.user_type = user_type;
      req.id = id;
      // console.log("..........decode..user_type....." + user_type);
      // console.log("..........decode..user_id....." + user_id);
      const sql = `SELECT * FROM ${constants.TEACHER_TABLE}  WHERE id = ? AND token = ?`;
      //const sql = `SELECT * FROM ${constants.USER_TYPE_ADMIN}  WHERE user_id = ?`;
      mysqldb.query(sql, [req.id, req.token], (err, rows, fields) => {
        if (err instanceof Error) {
          res.status(404).json({ message: "Access not allow" });
          return;
        } else if (rows.length < 1) {
          return res.status(401).json({
            message: "Invalid Token",
          });
        } else {
          console.log(
            `.....error.........${err}...........rows......${rows[0]}`
          );
          next();
        }
      });
    });
  } catch (err) {
    res.status(401).json({
      message: "Session expired!",
      err,
    });
  }
};
exports.getFcmAuthToken = async (req, res, next) => {
 // 
  const auth = new GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"], // Scope for FCM
  });

  // Get the client
  const client = await auth.getClient();
  // Get the access token
  const accessToken = await client.getAccessToken();
  req.fcm_auth_token = accessToken.token;
  next();
};
