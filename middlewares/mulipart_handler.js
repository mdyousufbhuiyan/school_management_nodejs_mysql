const path = require("path"); //used for file path
const fs = require("fs");
const db = require("../config/mysqldb");
const multer = require("multer");
const statusCode = require("../utils/status_code");
const storage = multer.diskStorage({
  destination: (req1, file, cb) => {
    cb(null, "uploads/"); // Save to uploads folder
  },
  filename: (req, file, cb) => {
    console.log(`.......title........${req.body.title}`);
    console.log(
      `.......file.originalname........${path.extname(file.originalname)}`
    );
    // Save the file with original extension
    //cb(null, Date.now() + path.extname(file.originalname));
    var fileName = Date.now() + "-" + path.basename(file.originalname);
    req.body.filename = fileName;
    cb(null, `${fileName}`); // Use extname() to preserve the file extension
  },
});
// Custom file filter for image or PDF files
const fileFilter = (req, file, cb) => {
  // Define allowed mimetypes for images
  // , 'application/pdf'
  const allowedTypes = ["image/jpeg", "image/jpg",'application/pdf', "image/png", "image/gif"];

  if (allowedTypes.includes(file.mimetype)) {
    // Accept the file if its mimetype matches
    cb(null, true);
  } else {
    // Reject the file if its mimetype is not allowed
    cb(
      new Error("Invalid file type. Only images (JPG, PNG, GIF),PDF are allowed."),
      false
    );
  }
};
exports.upload = multer({ storage: storage, fileFilter: fileFilter });
exports.uploadAttachment = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  console.log(`........req.body........${req.body.filename}`);
  // req.body will contain the form data as an object
  if (req.body.old_filename == null) {
    return res
      .status(statusCode.STATUS_OK)
      .json({ message: "File uploaded successfully!", file: req.file });
  } else {
    next();
    // return res
    //   .status(statusCode.STATUS_BAD_REQUEST)
    //   .json({ message: "No image file uploaded" });
  }
};

exports.deletOldFileAfterUpdating = (req, res) => {
  const filename = req.body.old_filename; // Get the filename from the URL parameter

  const filePath = path.join(__dirname, "../uploads", filename); // Full path to the file

  // Check if file exists and delete it
  fs.unlink(filePath, (err) => {
    if (err) {
    //   return res
    //     .status(500)
    //     .json({ error: err });
    }

    // res.status(200).json({
    //   message: "File deleted successfully!",
    //   filename: req.file,
    // });

    return res
    .status(statusCode.STATUS_OK)
    .json({ message: "File uploaded successfully!", file: req.file });
  });
};


exports.deletUloadedFile = (fileName,onDeleted) => {
 // const filename = req.body.old_filename; // Get the filename from the URL parameter

  const filePath = path.join(__dirname, "../uploads", fileName); // Full path to the file

  // Check if file exists and delete it
  fs.unlink(filePath, (err) => {
    if (err) {
    //   return res
    //     .status(500)
    //     .json({ error: err });
    }

    // res.status(200).json({
    //   message: "File deleted successfully!",
    //   filename: req.file,
    // });
    onDeleted('Deleted');
  });
};