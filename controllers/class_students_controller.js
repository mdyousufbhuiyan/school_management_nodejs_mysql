const express = require("express");
const configs = require("../config/config.json");
const constants = require("../utils/constants");
const statusCode = require("../utils/status_code");
const db = require("../config/mysqldb");
const stController = require("../controllers/students_controller");
const staticMessage = require("../utils/message");
const tName = constants.CLASS_STUDENT_TABLE_NAME;
const tObj = "cStudent";

exports.addClassStudent = (req, res) => {
  const sql = `SELECT * FROM ${tName} WHERE student_id =? AND class_room_id = ?`;
  db.query(
    sql,
    [req.body.student_id, req.body.class_room_id],
    (err, rows, fields) => {
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
        var payload = {
          student_id: req.body["student_id"],
          class_room_id: req.body["class_room_id"],
          // promoted_class_room_id: req.body["promoted_class_room_id"],
          roll_no: req.body["roll_no"],
          // promoted_roll_no: req.body["promoted_roll_no"],
        };
        db.query(`INSERT INTO ${tName} SET ?`, payload, (err, rows, fields) => {
          if (err instanceof Error) {
            console.log(err);
            return res.status(statusCode.STATUS_BAD_REQUEST).json({
              message: staticMessage.FAILED(req.headers.language),
              error: err,
            });
          } else if (rows) {
            res.status(statusCode.STATUS_OK).json({
              message: staticMessage.SUCCESS(req.headers.language),
              data: rows,
            });
          } else {
            console.log(rows);
            return res.status(statusCode.STATUS_BAD_REQUEST).json({
              message: staticMessage.FAILED(req.headers.language),
              data: rows,
            });
          }
        });
      }
    }
  );
};
//.....>>>>>>>>>Note<<<<<<<<<<....................
//if any classroom students already promoted to next class then
// this classroom can't be changed and any student can't enroll for that class room
exports.isValidClassRoomToChange = (req, res, next) => {
  const sql = `SELECT * FROM ${tName} WHERE class_room_id = ?`;
  var classRoomId =
    req.body.promoted_class_room_id == null
      ? req.body.class_room_id
      : req.body.promoted_class_room_id;
  console.log(`........isValidClassRoomToChange.......${classRoomId}`);
  db.query(
    sql,
    //  [req.body.promoted_class_room_id, req.body.student_id],
    [classRoomId],
    (err, rows, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: staticMessage.FAILED(req.headers.language),
          err,
        });
      }
      if (rows.length > 0 && rows[0]["promoted_class_room_id"] != null) {
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: staticMessage.INVALID_REQUEST_CLASS_ROOM_NOT_ALLOWED(
            req.headers.language
          ),
        });
      } else {
        next();
      }
    }
  );
};

exports.getClassAllStudent = (req, res) => {
  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }
  if (req.query.class_id != null) {
    conditions += `${tObj}.class_id = ?`;
    queryList.push(req.query.class_id);
  }
  if (req.query.group_id != null) {
    conditions += `${conditions.length > 0 ? "AND" : ""} ${tObj}.group_id = ?`;
    queryList.push(req.query.group_id);
  }

  if (req.query.academic_year_id != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.academic_year_id = ?`;
    queryList.push(req.query.academic_year_id);
  }
  console.log(`........conditions........${conditions}.....${queryList}`);
  if (queryList.length > 0) {
    // First, increase the group_concat_max_len to handle larger datasets
    db.query("SET SESSION group_concat_max_len = 100000000;", (err) => {
      if (err) {
        console.error("Error setting group_concat_max_len:", err);
        return res
          .status(500)
          .json({ error: "Failed to set session variable" });
      }
    });
    //................GROUP_CONCAT does not allow big data set need to increase size first............
    db.query(
      getRealtionalQueryWithStudentFullDetails(conditions,req.headers.language),
      queryList,
      (err, results, fields) => {
        if (err instanceof Error) {
          console.log(err);
          return res.status(statusCode.STATUS_BAD_REQUEST).json({
            message: staticMessage.FAILED(req.headers.language),
            error: err,
          });
        }

        return res.status(statusCode.STATUS_OK).json({
          message: staticMessage.SUCCESS(req.headers.language),
          data: parseRelationalDataToJson(results),
        });
        // return res.status(statusCode.STATUS_OK).json(results);
      }
    );
  } else {
    return res.status(statusCode.STATUS_BAD_REQUEST).json({
      message: staticMessage.QUERY_PARAMETERS_IS_REQUIRED(req.headers.language),
    });
  }
};

exports.getStudentByStudentId = (req, res) => {
  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }
  if (req.params.id != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.student_id = ?`;
    queryList.push(req.params.id);
  }

  if (queryList.length > 0) {
    // First, increase the group_concat_max_len to handle larger datasets
    db.query("SET SESSION group_concat_max_len = 100000000;", (err) => {
      if (err) {
        console.error("Error setting group_concat_max_len:", err);
        return res
          .status(500)
          .json({ error: "Failed to set session variable" });
      }
    });
    //................GROUP_CONCAT does not allow big data set need to increase size first............
    db.query(
      getRealtionalQueryWithStudentFullDetails(conditions,req.headers.language),
      queryList,
      (err, results, fields) => {
        if (err instanceof Error) {
          console.log(err);
          return res.status(statusCode.STATUS_BAD_REQUEST).json({
            message: "Failed",
            error: err,
          });
        }
        if (results.length > 0) {
          return res.status(statusCode.STATUS_OK).json({
            message: "Success",
            data: parseRelationalDataToJson(results)[0],
          });
        } else {
          return res.status(statusCode.STATUS_NOT_FOUND).json({
            message: "Not Found",
          });
        }
        // return res.status(statusCode.STATUS_OK).json(results);
      }
    );
  } else {
    return res.status(statusCode.STATUS_BAD_REQUEST).json({
      message: staticMessage.QUERY_PARAMETERS_IS_REQUIRED(req.headers.language),
    });
  }
};
exports.getStudentLastPromotedClassRoomInfoByStudentId = (req, res) => {
  var conditions = "";
  var queryList = [];
  // if (req.query.class_room_id != null) {
  // conditions += `${tObj}.promoted_class_room_id = ?`;
  //   queryList.push(null);
  // }
  if (req.params.id != null) {
    conditions += `${
      conditions.length > 0 ? " AND " : ""
    } ${tObj}.student_id = ?`;
    queryList.push(req.params.id);
  }
  conditions += `${
    conditions.length > 0 ? " AND " : ""
  } ${tObj}.promoted_class_room_id IS NULL`;
  //queryList.push("");
  if (queryList.length > 0) {
    // First, increase the group_concat_max_len to handle larger datasets
    db.query("SET SESSION group_concat_max_len = 100000000;", (err) => {
      if (err) {
        console.error("Error setting group_concat_max_len:", err);
        return res
          .status(500)
          .json({ error: "Failed to set session variable" });
      }
    });
    //................GROUP_CONCAT does not allow big data set need to increase size first............
    db.query(
      getRealtionalQueryWithStudentFullDetails(conditions,req.headers.language),
      queryList,
      (err, results, fields) => {
        if (err instanceof Error) {
          console.log(err);
          return res.status(statusCode.STATUS_BAD_REQUEST).json({
            message: "Failed",
            error: err,
          });
        }
        if (results.length > 0) {
          return res.status(statusCode.STATUS_OK).json({
            message: "Success",
            data: parseRelationalDataToJson(results)[0],
          });
        } else {
          return res.status(statusCode.STATUS_NOT_FOUND).json({
            message: "Not Found",
          });
        }
        // return res.status(statusCode.STATUS_OK).json(results);
      }
    );
  } else {
    return res.status(statusCode.STATUS_BAD_REQUEST).json({
      message: staticMessage.QUERY_PARAMETERS_IS_REQUIRED(req.headers.language),
    });
  }
};
exports.updateClassStudentBeforePromotion = (req, res) => {
  const query = `SELECT * FROM ${tName} WHERE id = ?`;
  // Execute the query
  db.query(query, req.body.class_student_id, (err, result) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    if (result.length > 0) {
      if (
        result[0]["promoted_class_room_id"] != null ||
        result[0]["promoted_roll_no"] != null
      ) {
        if (
          req.body.class_room_id != result[0]["class_room_id"] ||
          req.body.roll_no != result[0]["roll_no"]
        ) {
          return res.status(statusCode.STATUS_BAD_REQUEST).json({
            message: staticMessage.NOT_ALLOWED_TO_CHANGE_CLASS_ROOM_HERE(
              req.headers.language
            ),
          });
        } else {
          return res.status(statusCode.STATUS_OK).json({
            message: staticMessage.UPDATED_SUCCESSFULLY(req.headers.language),
          });
        }
      } else {
        var oldClassRoomId = result[0]["class_room_id"];
        var stdId = result[0]["student_id"];
        // SQL query to update user's name and email
        const query = `UPDATE ${tName} SET class_room_id = ?,roll_no = ?
         WHERE id = ?`;
        // Execute the query
        db.query(
          query,
          [req.body.class_room_id, req.body.roll_no, req.body.class_student_id],
          (err, result) => {
            if (err instanceof Error) {
              console.log(err);
              return res.status(statusCode.STATUS_BAD_REQUEST).json({
                message: staticMessage.FAILED(req.headers.language),
                error: err,
              });
            }

            // Check if any row was updated
            if (result.affectedRows === 0) {
              return res.status(statusCode.STATUS_NOT_FOUND).json({
                message: staticMessage.NOT_FOUND(req.headers.language),
              });
            } else {
              const query = `UPDATE ${tName} SET promoted_class_room_id = ?,promoted_roll_no = ?
                WHERE promoted_class_room_id = ? AND student_id = ?`;

              db.query(
                query,
                [
                  req.body.class_room_id,
                  req.body.roll_no,
                  oldClassRoomId,
                  stdId,
                ],
                (err, result) => {
                  if (err instanceof Error) {
                    console.log(err);
                    return res.status(statusCode.STATUS_BAD_REQUEST).json({
                      message: staticMessage.FAILED(req.headers.language),
                      error: err,
                    });
                  }

                  if (result.affectedRows === 0) {
                    //.....note...........
                    //........if newly added student, then will not have previous promoted class
                    res.status(statusCode.STATUS_OK).json({
                      message: staticMessage.UPDATED_SUCCESSFULLY(
                        req.headers.language
                      ),
                      data: result.affectedRows,
                    });
                    // return res
                    //   .status(statusCode.STATUS_NOT_FOUND)
                    //   .json({ message: "Newly Added Student" });
                  } else {
                    res.status(statusCode.STATUS_OK).json({
                      message: staticMessage.UPDATED_SUCCESSFULLY(
                        req.headers.language
                      ),
                      data: result.affectedRows,
                    });
                  }
                }
              );
            }
          }
        );
      }
    } else {
      return res
        .status(statusCode.STATUS_NOT_FOUND)
        .json({ message: staticMessage.NOT_FOUND(req.headers.language) });
    }
  });
};

exports.deleteStudentFromStudentPortal = (req, res) => {
  const query = `SELECT * FROM ${tName} WHERE id = ? AND student_id = ? AND class_room_id = ?`;
  if (
    req.query.student_id == null ||
    req.query.class_room_id == null ||
    req.params.id == null
  ) {
    return res.status(statusCode.STATUS_BAD_REQUEST).json({
      message: "ClassRoom / Student required",
    });
  } else {
    // Execute the query
    db.query(
      query,
      [req.params.id, req.query.student_id, req.query.class_room_id],
      (err, result) => {
        if (err instanceof Error) {
          console.log(err);
          return res.status(statusCode.STATUS_BAD_REQUEST).json({
            message: staticMessage.FAILED(req.headers.language),
            error: err,
          });
        }
        if (result.length > 0) {
          if (
            result[0]["promoted_class_room_id"] != null ||
            result[0]["promoted_roll_no"] != null
          ) {
            return res.status(statusCode.STATUS_BAD_REQUEST).json({
              message:
                staticMessage.ALREADY_PROMOTED_TO_NEXT_CLASS_NOT_ALLOWED_TO_DELETE_HERE(
                  req.headers.language
                ),
            });
          } else {
            //  //   var classRoomId = result[0]["class_room_id"];
            //     var stdId = result[0]["student_id"];
            // SQL query to update user's name and email
            const query = `UPDATE ${tName} SET promoted_class_room_id = ?,promoted_roll_no = ?
             WHERE student_id = ? AND promoted_class_room_id = ?`;
            // Execute the query
            db.query(
              query,
              [null, null, req.query.student_id, req.query.class_room_id],
              (err, result) => {
                if (err instanceof Error) {
                  console.log(err);
                  return res.status(statusCode.STATUS_BAD_REQUEST).json({
                    message: staticMessage.FAILED(req.headers.language),
                    error: err,
                  });
                }

                // // Check if any row was updated
                // if (result.affectedRows === 0) {
                //   return res
                //     .status(statusCode.STATUS_NOT_FOUND)
                //     .json({ message: "Not found" });
                // } else {

                // }

                // SQL query to delete the record from the database
                const sql = `DELETE FROM ${tName} WHERE id = ? AND class_room_id = ? AND student_id = ?`;

                // Execute the SQL query
                db.query(
                  sql,
                  [
                    req.params.id,
                    req.query.class_room_id,
                    req.query.student_id,
                  ],
                  (err, result) => {
                    if (err) {
                      console.error("Error deleting User:", err);
                      return res.status(statusCode.STATUS_BAD_REQUEST).json({
                        message: staticMessage.FAILED_TO_DELETE(
                          req.headers.language
                        ),
                        error: err,
                      });
                    }

                    if (result.affectedRows === 0) {
                      return res.status(statusCode.STATUS_NOT_FOUND).json({
                        message: staticMessage.NOT_FOUND(req.headers.language),
                      });
                    }

                    // If the record is deleted successfully
                    return res.status(statusCode.STATUS_OK).json({
                      message: staticMessage.DELETED_SUCCESSFULLY(
                        req.headers.language
                      ),
                    });
                  }
                );
              }
            );
          }
        } else {
          return res
            .status(statusCode.STATUS_NOT_FOUND)
            .json({ message: staticMessage.NOT_FOUND(req.headers.language) });
        }
      }
    );
  }
};
exports.validatePromotion = (req, res, next) => {
  // var stVar = 'st';
  // var stFields = '';
  //  stController.allStudentField.forEach((element)=>{
  //     if(stFields===''){
  //      stFields+=`${element},${stVar}.${element}`;
  //     }else{
  //   stFields+=`,${element},${stVar}.${element}`;
  //     }
  // });
  // console.log(`........all student field........${stFields}`);
  if (req.body["class_room_id"] === req.body["promoted_class_room_id"]) {
    return res
      .status(statusCode.STATUS_NOT_FOUND)
      .json({ message: "Promotion can't be same class" });
  }
  const sql = `SELECT * FROM ${tName} WHERE class_room_id = ? AND student_id = ?`;
  db.query(
    sql,
    [req.body.class_room_id, req.body.student_id],
    (err, rows, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: staticMessage.FAILED(req.headers.language),
          err,
        });
      }
      if (rows.length > 0)
        var oldPCRID =
          rows.length > 0 ? rows[0]["promoted_class_room_id"] : null;
      // console.log(
      //   `.......promoted_class_room_id.inner... rows2.temp....${oldPCRID}`
      // );
      if (rows.length > 0 && oldPCRID != null) {
        const sql = `SELECT * FROM ${tName} WHERE class_room_id = ? AND student_id = ?`;
        db.query(sql, [oldPCRID, req.body.student_id], (err, rows2, fields) => {
          if (err instanceof Error) {
            console.log(err);
            return res.status(statusCode.STATUS_BAD_REQUEST).json({
              message: staticMessage.FAILED(req.headers.language),
              err,
            });
          }
          var pcrId2 =
            rows2.length > 0 ? rows2[0]["promoted_class_room_id"] : null;
          if (rows2.length > 0 && pcrId2 != null) {
            return res.status(statusCode.STATUS_BAD_REQUEST).json({
              message: staticMessage.THIS_PROMOTION_CYCLE_ALREADY_DONE(
                req.headers.language
              ),
            });
          } else {
            if (oldPCRID === req.body.promoted_class_room_id) {
              // return res
              // .status(statusCode.STATUS_OK)
              // .json({ message: "Promotion  possible from update" });
              req.body.isAdd = false;
              req.body.old_promoted_class_room_id = oldPCRID;
              next();
            } else {
              // return res
              // .status(statusCode.STATUS_OK)
              // .json({ message: "Promotion  possible from update" });
              req.body.isAdd = false;
              req.body.old_promoted_class_room_id = oldPCRID;
              next();
            }
          }
        });
      } else if (rows.length > 0) {
        // return res
        // .status(statusCode.STATUS_OK)
        // .json({ message: "Promotion  possible from add" });
        req.body.isAdd = true;
        next();
      } else {
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: staticMessage.INTERNEL_SERVER_ERROR(req.headers.language),
        });
      }
    }
  );
};
// //delete
exports.promotionToNextClass = (req, res) => {
  var payload = {
    student_id: req.body["student_id"],
    class_room_id: req.body["class_room_id"],
    promoted_class_room_id: req.body["promoted_class_room_id"],
    roll_no: req.body["roll_no"],
    promoted_roll_no: req.body["promoted_roll_no"],
  };

  if (req.body.isAdd === true) {
    // SQL query to update user's name and email
    const query = `UPDATE ${tName} SET promoted_class_room_id = ?, promoted_roll_no = ?
      WHERE student_id =? AND class_room_id = ?`;
    // Execute the query
    db.query(
      query,
      [
        req.body.promoted_class_room_id,
        req.body.promoted_roll_no,
        req.body.student_id,
        req.body.class_room_id,
      ],
      (err, rows) => {
        if (err instanceof Error) {
          console.log(err);
          return res.status(statusCode.STATUS_BAD_REQUEST).json({
            message: "Failed",
            error: err,
          });
        }

        // Check if any row was updated
        if (rows.affectedRows === 0) {
          return res
            .status(statusCode.STATUS_NOT_FOUND)
            .json({ message: "Not found" });
        } else {
          const query = `INSERT INTO ${tName} SET student_id = ?,class_room_id = ?,roll_no = ?`;

          db.query(
            query,
            [
              req.body.student_id,
              req.body.promoted_class_room_id,
              req.body.promoted_roll_no,
            ],
            (err, rows) => {
              if (err instanceof Error) {
                console.log(err);
                return res.status(statusCode.STATUS_BAD_REQUEST).json({
                  message: "Failed",
                  error: err,
                });
              } else if (rows) {
                res.status(statusCode.STATUS_OK).json({
                  message: "Updated Successfully",
                  data: rows,
                });
              } else {
                console.log(rows);
                return res
                  .status(statusCode.STATUS_INTERNAL_SERVER_ERROR)
                  .json({
                    message: "Failed",
                    data: rows,
                  });
              }
            }
          );
        }
      }
    );
  } else {
    // SQL query to update user's name and email
    const query = `UPDATE ${tName} SET promoted_class_room_id = ?, promoted_roll_no = ?
       WHERE student_id =? AND class_room_id = ?`;
    // Execute the query
    db.query(
      query,
      [
        req.body.promoted_class_room_id,
        req.body.promoted_roll_no,
        req.body.student_id,
        req.body.class_room_id,
      ],
      (err, result) => {
        if (err instanceof Error) {
          console.log(err);
          return res.status(statusCode.STATUS_BAD_REQUEST).json({
            message: staticMessage.FAILED(req.headers.language),
            error: err,
          });
        }

        // Check if any row was updated
        if (result.affectedRows === 0) {
          return res
            .status(statusCode.STATUS_NOT_FOUND)
            .json({ message: staticMessage.NOT_FOUND(req.headers.language) });
        } else {
          const query = `UPDATE ${tName} SET class_room_id = ?,roll_no = ?
           WHERE student_id =? AND class_room_id = ?`;

          db.query(
            query,
            [
              req.body.promoted_class_room_id,
              req.body.promoted_roll_no,
              req.body.student_id,
              req.body.old_promoted_class_room_id,
            ],
            (err, rows) => {
              if (err instanceof Error) {
                console.log(err);
                return res.status(statusCode.STATUS_BAD_REQUEST).json({
                  message: staticMessage.FAILED(req.headers.language),
                  error: err,
                });
              } else if (rows) {
                res.status(statusCode.STATUS_OK).json({
                  message: staticMessage.UPDATED_SUCCESSFULLY(
                    req.headers.language
                  ),
                  data: rows,
                });
              } else {
                console.log(rows);
                return res
                  .status(statusCode.STATUS_INTERNAL_SERVER_ERROR)
                  .json({
                    message: staticMessage.FAILED(req.headers.language),
                    data: rows,
                  });
              }
            }
          );
        }
      }
    );
  }
};

exports.getIndividualStudentClassRoomInfo = (req, res) => {
  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }
  if (req.query.student_id != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.student_id = ?`;
    queryList.push(req.query.student_id);
  }
  var language = req.headers.language;
  console.log(`........conditions........${conditions}.....${queryList}`);
  var onlyClassRoomInfoRelationQuery = `${tObj}.class_room_id as id,
  ${language == constants.LANGUAGE_BN ? "c.name_bn" : "c.name"} as class_name,
  ${language == constants.LANGUAGE_BN ? "g.name_bn" : "g.name"} as group_name,
  ${
    language == constants.LANGUAGE_BN ? "a.name_bn" : "a.name"
  } as academic_year_name,
   c.id as class_id,
   g.id as group_id,
   a.id as academic_year_id
FROM ${tName} as ${tObj}
LEFT JOIN ${
    constants.CLASS_ROOM_TABLE_NAME
  } as cr ON ${tObj}.class_room_id = cr.id
LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON cr.class_id = c.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON cr.group_id = g.id
LEFT JOIN ${
    constants.ACADEMIC_YEAR_TABLE_NAME
  } as a ON cr.academic_year_id = a.id
`;
  if (queryList.length > 0) {
    const sql = `SELECT 
${onlyClassRoomInfoRelationQuery} WHERE ${conditions} ORDER BY a.name DESC ,g.name ASC`;

    db.query(sql, queryList, (err, rows, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return res.status(statusCode.STATUS_BAD_REQUEST).json({
          message: "Failed",
          error: err,
        });
      }
      //  console.log(rows);
      return res.status(statusCode.STATUS_OK).json({
        message: "Success",
        data: parseRelationalDataToJson(rows),
      });
    });
  } else {
    return res.status(statusCode.STATUS_OK).json({
      message: message.SUCCESS(req.headers.language),
      data: [],
    });
  }
};

exports.studentGolobalSearch = (req, res) => {
  var conditions = "";
  var queryList = [];
  if (req.query.class_room_id != null) {
    conditions += `${tObj}.class_room_id = ?`;
    queryList.push(req.query.class_room_id);
  }
  if (req.query.class_id != null) {
    conditions += `${tObj}.class_id = ?`;
    queryList.push(req.query.class_id);
  }
  if (req.query.group_id != null) {
    conditions += `${conditions.length > 0 ? "AND" : ""} ${tObj}.group_id = ?`;
    queryList.push(req.query.group_id);
  }

  if (req.query.academic_year_id != null) {
    conditions += `${
      conditions.length > 0 ? "AND" : ""
    } ${tObj}.academic_year_id = ?`;
    queryList.push(req.query.academic_year_id);
  }
  console.log(`........conditions........${conditions}.....${queryList}`);
  var sql;

  if (queryList.length > 0) {
    // First, increase the group_concat_max_len to handle larger datasets
    db.query("SET SESSION group_concat_max_len = 100000000;", (err) => {
      if (err) {
        console.error("Error setting group_concat_max_len:", err);
        return res
          .status(500)
          .json({ error: "Failed to set session variable" });
      }
    });
    //................GROUP_CONCAT does not allow big data set need to increase size first............
    sql = `SELECT ${tObj}.id,${tObj}.student_id,${tObj}.class_room_id,${tObj}.promoted_class_room_id,
    ${tObj}.roll_no,${tObj}.promoted_roll_no,
      ${
        req.headers.language == constants.LANGUAGE_BN
          ? "st.first_name_bn"
          : "st.first_name"
      } as first_name, ${
      req.headers.language == constants.LANGUAGE_BN
        ? "st.last_name_bn"
        : "st.last_name"
    } as last_name,st.user_id,
    JSON_OBJECT('class_id', c.id,'class_name',${
      req.headers.language == constants.LANGUAGE_BN ? "c.name_bn" : "c.name"
    },'group_id', g.id,'group_name', ${
      req.headers.language == constants.LANGUAGE_BN ? "g.name_bn" : "g.name"
    },'academic_year_id', a.id,'academic_year_name', ${
      req.headers.language == constants.LANGUAGE_BN ? "a.name_bn" : "a.name"
    }) AS class_room_info,
   JSON_OBJECT('class_id', pc.id,'class_name', pc.name,'group_id', pg.id,'group_name', pg.name,'academic_year_id', pa.id,'academic_year_name', pa.name) AS promoted_class_room_info,

    JSON_OBJECT('id', st.id,'first_name',
       ${
         req.headers.language == constants.LANGUAGE_BN
           ? "st.first_name_bn"
           : "st.first_name"
       },'last_name',${
      req.headers.language == constants.LANGUAGE_BN
        ? "st.last_name_bn"
        : "st.last_name"
    },'user_id',st.user_id,
       'roll_no',${tObj}.roll_no) AS student_info
     FROM ${tName} as ${tObj}
   LEFT JOIN ${
     constants.CLASS_ROOM_TABLE_NAME
   } as cr ON ${tObj}.class_room_id = cr.id
   LEFT JOIN ${
     constants.CLASS_ROOM_TABLE_NAME
   } as pcr ON ${tObj}.promoted_class_room_id = pcr.id
   LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON cr.class_id = c.id
   LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON cr.group_id = g.id
   LEFT JOIN ${
     constants.ACADEMIC_YEAR_TABLE_NAME
   } as a ON cr.academic_year_id = a.id
   LEFT JOIN ${constants.CLASS_NAME_TABLE} as pc ON pcr.class_id = pc.id
   LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as pg ON pcr.group_id = pg.id
   LEFT JOIN ${
     constants.ACADEMIC_YEAR_TABLE_NAME
   } as pa ON pcr.academic_year_id = pa.id
   LEFT JOIN ${constants.STUDENT_TABLE} as st ON ${tObj}.student_id = st.id
  WHERE ${conditions} ORDER BY CAST(${tObj}.roll_no AS UNSIGNED) ASC`;
  } else {
    return res.status(statusCode.STATUS_BAD_REQUEST).json({
      message: "Query parameters is required",
    });
  }
  // First, increase the group_concat_max_len to handle larger datasets
  db.query("SET SESSION group_concat_max_len = 100000000;", (err) => {
    if (err) {
      console.error("Error setting group_concat_max_len:", err);
      return res
        .status(statusCode.STATUS_BAD_REQUEST)
        .json({ error: "Failed to set session variable" });
    }
  });
  db.query(sql, queryList, (err, results, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return res.status(statusCode.STATUS_BAD_REQUEST).json({
        message: staticMessage.FAILED(req.headers.language),
        error: err,
      });
    }
    // console.log('Query Results:', results);
    // results.forEach((element) => {
    //   element["student_info"] = element.student_info != null ? JSON.parse(element.student_info) : {};
    // });

    parseRelationalDataToJson(results);

    return res.status(statusCode.STATUS_OK).json(results);
  });
};

var parseRelationalDataToJson = (rows) => {
  // Format the results as JSON objects
  rows.forEach((element) => {
    // element["academic_year_id"] = JSON.parse(element.academic_year_id);
    // element["subject_ids"] = JSON.parse(element.subject_ids);
    // element["teacher_ids"] = JSON.parse(element.teacher_ids);
    // element["time_slot_ids"] = JSON.parse(element.time_slot_ids);
    element.class_info != null
      ? (element["class_info"] = JSON.parse(element.class_info))
      : {};
    element.group_info != null
      ? (element["group_info"] = JSON.parse(element.group_info))
      : {};
    element.academic_year_info != null
      ? (element["academic_year_info"] = JSON.parse(element.academic_year_info))
      : {};
    element.student_info != null
      ? (element["student_info"] = JSON.parse(element.student_info))
      : {};
    element.promoted_class_room_info != null
      ? (element["promoted_class_room_info"] = JSON.parse(
          element.promoted_class_room_info
        ))
      : {};
    element.class_room_info != null
      ? (element["class_room_info"] = JSON.parse(element.class_room_info))
      : {};
    element.post_office_info != null
      ? (element["post_office_info"] = JSON.parse(element.post_office_info))
      : {};
    element.upozila_info != null
      ? (element["upozila_info"] = JSON.parse(element.upozila_info))
      : {};
    element.district_info != null
      ? (element["district_info"] = JSON.parse(element.district_info))
      : {};
    element.division_info != null
      ? (element["division_info"] = JSON.parse(element.division_info))
      : {};
  });
  return rows;
};

function getRealtionalQueryWithStudentFullDetails(conditions,language) {
  var stVar = "stVar";
  var stFields = "";
  stController.allStudentField.forEach((element) => {
    if (stFields === "") {
      if (
        element === "roll_no" ||
        element === "class_room_id" ||
        element === "promoted_class_room_id"
      ) {
        stFields += `'${element}',${tObj}.${element}`;
      } else {
        stFields += `'${element}',${stVar}.${element}`;
      }
    } else {
      if (
        element === "roll_no" ||
        element === "class_room_id" ||
        element === "promoted_class_room_id"
      ) {
        stFields += `,'${element}',${tObj}.${element}`;
      } else {
        stFields += `,'${element}',${stVar}.${element}`;
      }
    }
  });

  var query = `SELECT ${tObj}.id,${tObj}.student_id,${tObj}.class_room_id,${tObj}.promoted_class_room_id,
  ${tObj}.roll_no,${tObj}.promoted_roll_no,
  JSON_OBJECT('class_id', c.id,'class_name',${language==constants.LANGUAGE_BN?'c.name_bn':'c.name'} ,'group_id', g.id,'group_name', ${language==constants.LANGUAGE_BN?'g.name_bn':'g.name'},'academic_year_id', a.id,'academic_year_name', ${language==constants.LANGUAGE_BN?'a.name_bn':'a.name'}) AS class_room_info,
 JSON_OBJECT('class_id', pc.id,'class_name', pc.name,'group_id', pg.id,'group_name', pg.name,'academic_year_id', pa.id,'academic_year_name', pa.name) AS promoted_class_room_info,
 JSON_OBJECT(${stFields}) AS student_info,
 JSON_OBJECT('id', d.id,'name', d.name,'name_bn', d.bn_name) AS division_info,
 JSON_OBJECT('id', dist.id,'name', dist.name,'division_id', dist.division_id,'name_bn', dist.bn_name) AS district_info,
 JSON_OBJECT('id', u.id,'name', u.name,'district_id', u.district_id,'name_bn', u.bn_name) AS upozila_info,
 JSON_OBJECT('id', p.id,'name', p.name,'upozila_id', p.upazilla_id,'name_bn', p.bn_name) AS post_office_info

   FROM ${tName} as ${tObj}
 LEFT JOIN ${constants.CLASS_ROOM_TABLE_NAME} as cr ON ${tObj}.class_room_id = cr.id
 LEFT JOIN ${constants.CLASS_ROOM_TABLE_NAME} as pcr ON ${tObj}.promoted_class_room_id = pcr.id
 LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON cr.class_id = c.id
 LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON cr.group_id = g.id
 LEFT JOIN ${constants.ACADEMIC_YEAR_TABLE_NAME} as a ON cr.academic_year_id = a.id
 LEFT JOIN ${constants.CLASS_NAME_TABLE} as pc ON pcr.class_id = pc.id
 LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as pg ON pcr.group_id = pg.id
 LEFT JOIN ${constants.ACADEMIC_YEAR_TABLE_NAME} as pa ON pcr.academic_year_id = pa.id
 LEFT JOIN ${constants.STUDENT_TABLE} as ${stVar} ON ${tObj}.student_id = ${stVar}.id
 LEFT JOIN ${constants.DIVISION_TABLE_NAME} as d ON ${stVar}.division_id = d.id
 LEFT JOIN ${constants.DISTRICT_TABLE_NAME} as dist ON ${stVar}.district_id = dist.id
 LEFT JOIN ${constants.UPAZILA_TABLE_NAME} as u ON ${stVar}.upozila_id = u.id
 LEFT JOIN ${constants.UNION_TABLE_NAME} as p ON ${stVar}.post_office_id = p.id
 
 WHERE ${conditions} ORDER BY CAST(${tObj}.roll_no AS UNSIGNED) ASC`;
  return query;
}

var getRelationalQuery = `
JSON_OBJECT('id', c.id,'name', c.name) AS class_info,
JSON_OBJECT('id', g.id,'name', g.name,'name_bn', g.bn_name) AS group_info,
JSON_OBJECT('id', a.id,'name', a.name) AS academic_year_info,
JSON_OBJECT('id', pc.id,'name', pc.name) AS promoted_class_info,
JSON_OBJECT('id', pg.id,'name', pg.name,'name_bn', pg.bn_name) AS promoted_group_info,
JSON_OBJECT('id', pa.id,'name', pa.name) AS promoted_academic_year_info
FROM ${tName} as ${tObj}
LEFT JOIN ${constants.CLASS_ROOM_TABLE_NAME} as cr ON ${tObj}.class_room_id = cr.id
LEFT JOIN ${constants.CLASS_NAME_TABLE} as c ON cr.class_id = c.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as g ON cr.group_id = g.id
LEFT JOIN ${constants.ACADEMIC_YEAR_TABLE_NAME} as a ON cr.academic_year_id = a.id
LEFT JOIN ${constants.CLASS_NAME_TABLE} as pc ON cr.class_id = pc.id
LEFT JOIN ${constants.GROUP_NAME_TABLE_NAME} as pg ON cr.group_id = pg.id
LEFT JOIN ${constants.ACADEMIC_YEAR_TABLE_NAME} as pa ON cr.academic_year_id = pa.id
`;

exports.allFields = [
  "id",
  "student_id",
  "class_room_id",
  "promoted_class_room_id",
  "roll_no",
  "promoted_roll_no",
  "created_at",
  "updated_at",
];

exports.selectedFields = (obj) => {
  var excludedField = [
    //  "password",
    // "division_id",
    // "district_id",
    // "upozila_id",
    // "created_at",
    // "updated_at",
  ];
  var selectedField = [];
  this.allFields.forEach((element) => {
    if (!excludedField.includes(element))
      selectedField.push(`${obj}.${element}`);
  });
  return selectedField;
};
