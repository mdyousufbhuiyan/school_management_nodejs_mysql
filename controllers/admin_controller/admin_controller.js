const express = require("express");
const bcrypt = require("bcryptjs");
const constants = require("../../utils/constants");
const db = require("../../config/mysqldb");

// Retrieve all admins
exports.retrieveAllAdmins = (req, res) => {
  console.log('.......retrieveAllAdmins.......');
  const sql = `SELECT ${this.selectedFieldToShow} FROM ${constants.USER_TYPE_ADMIN}`;

  db.query(sql, (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(401).json({
        message: "Failed",
      });
    } else {
      res.status(200).json({
        data: rows,
      });
    }
  });
};
// Retrieve admin  by ID
exports.retrieveAdminById = (req, res) => {
  let id = req.params.id;
  const sql = `SELECT ${this.selectedFieldToShow} FROM ${constants.USER_TYPE_ADMIN} WHERE id = ?`;

  db.query(sql,[id], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(401).json({
        message: "Failed",
      });
    } else {
     if(rows.length>0){
      res.status(200).json({
        data: rows[0],
      });
     }else{
      res.status(200).json({
        message: "No user found",
      });
     }
    }
  });
};
// Retrieve admin  by ID

//Add new admin
exports.addNewAdmin = (req, res) => {
  const sql = `SELECT * FROM ${constants.USER_TYPE_ADMIN} WHERE user_id = ?`;
  db.query(sql, [req.body.user_id], (err, rows, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(401).json({
        message: "Failed",
      });
    }
    if (rows.length > 0) {
      console.log(rows);
      return res.status(401).json({
        message: "admin already exists",
      });
    } else {
      const hash = bcrypt.hashSync(req.body.password, 8);
      req.body.password = hash;
      // var user = {
      //   user_type: req.body.user_type,
      //   user_id: req.body.user_id,
      //   db_name: req.body.db_name,
      //   profile: req.body.profile,
      //   email: req.body.email,
      //   nid: req.body.nid,
      //   first_name: req.body.first_name,
      //   middle_name: req.body.middle_name,
      //   last_name: req.body.last_name,
      //   gender: req.body.gender,
      //   dob: req.body.dob,
      //   phone: req.body.phone,
      //   password: hash,
      //   is_active: req.body.is_active,
      //   is_single_attendance_for_all: req.body.is_single_attendance_for_all,
      // };
      console.log(req.body);
      // is_active: req.body.is_active,
      // is_single_attendance_for_all: req.body.is_single_attendance_for_all

      db.query(
        `INSERT INTO ${constants.USER_TYPE_ADMIN} SET ?`,
        req.body,
        (err, rows, fields) => {
          if (err instanceof Error) {
            console.log(err);
            return res.status(401).json({
              message: "Failed",
            });
          } else if (rows) {
            res.status(201).json({
              message: "Success",
              data: rows,
            });
          } else {
            console.log(rows);
            return res.status(401).json({
              message: "Admin registration failed",
            });
          }
        }
      );
    }
  });
};
//update
exports.update = (req, res) => {
  var hash = null;
  if (req.body.password) {
    hash = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hash;
  }
  const id = req.params.id; // Get the user id from the URL
  const updateData = req.body; // Get the fields to update from the request body
  
  // Dynamically build the SQL SET clause and the values array for the query
  let setClause = [];
   let values = [];
  // key === "password" ||
  // Loop through the keys of the object and build the SET part of the query
  for (let key in updateData) {
    if ( key === "user_id") {
    
    } else {
      //console.log(`............id.......${updateData.profile}`);
      setClause.push(`${key} = ?`); // For each key in the object, add `key = ?`
      values.push(updateData[key]); // Push the value corresponding to the key
    }
  }

  // console.log(`.............setClause.......${setClause}..values....${values}`);
  // Add the user ID to the values array (for the WHERE clause)
  values.push(id);

  // Construct the final UPDATE query string
  const query = `UPDATE ${constants.USER_TYPE_ADMIN} SET ${setClause.join(
    ", "
  )} WHERE id = ?`;
 
  // Execute the query
  db.query(query, values, (err, result) => {
  
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return a success response
    res.status(200).json({
      message: "User updated successfully",
      affectedRows: result.affectedRows,
    });
  });

  // adminSchema
  //   .findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
  //   .then((result) => {
  //     return res.status(200).json({
  //       message: result ? "Updated successfully" : "Failed",
  //       data: result,
  //     });
  //   })
  //   .catch((err) => {
  //     return res.status(400).json({
  //       message: "Updating failed",
  //       error: err,
  //     });
  //   });
};

// //delete
exports.deleteCon = (req, res) => {
  const id = req.params.id; // Get the ID from the request parameters

  // SQL query to delete the record from the database
  const sql = `DELETE FROM ${constants.USER_TYPE_ADMIN} WHERE id = ?`;

  // Execute the SQL query
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting User:', err);
      return res.status(500).json({ message: 'Failed to delete user', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If the record is deleted successfully
    return res.status(200).json({ message: 'User deleted successfully' });
  });
};
// exports.find = (req, res) => {
//   var name = req.body.name;
//   var query = {};
//   query[name] = { $regex: req.body.value };
//   adminSchema
//     .find(query)
//     .exec()
//     .then((resultList) => {
//       if (resultList) {
//         return res.json(resultList);
//       }
//     });
// };

exports.selectedFieldToShow = [
  "id",
  // "token",
  "user_id",
  "user_type",
  "profile",
  "email",
  "nid",
  "first_name",
  "middle_name",
  "last_name",
  "gender",
  "dob",
  "phone",
  "is_single_attendance_for_all",
  "is_active",
  "created_at",
  "updated_at",
];
