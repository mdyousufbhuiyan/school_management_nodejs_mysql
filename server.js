const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const adminLoginRoute = require("./routes/admin_login_route");
const adminRoute = require('./routes/admin/admin_routes')
const studentRoute = require('./routes/student/student_routes')
const teacherRoute = require('./routes/teacher/teacher_routes')
const configs = require('./config/config.json');
const constants = require("./utils/constants");
// const busboy = require('connect-busboy'); //middleware for form/file upload
// Middleware to parse URL-encoded data (for simple form submissions)
app.use(express.urlencoded({ extended: true }));
const path = require('path'); //used for file path
const fs = require('fs');
const router = express.Router();
const db = require("./config/mysqldb");
require('./config/dbCon');
const multer = require('multer');
// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({ origin: '*' }));
// Serve static files (images) from the "uploads" folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serving images from the server
app.get('/attachment/:imageName', (req, res) => {
  const imagePath = path.join(__dirname, 'uploads', req.params.imageName);
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).send('Image not found');
    }
  });
});
app.use("/api/", adminLoginRoute);
app.use("/api/admin",adminRoute);
app.use("/api/student",studentRoute);
app.use("/api/teacher",teacherRoute);

// Global error handler for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer specific errors (e.g., file size limit exceeded)
    return res.status(400).json({ error: err.message });
  }

  // Handle other errors
  return res.status(500).json({ error: err.message });
});
const server = app.listen(configs.BACKEND_PORT, function () {
    console.log("Student management system backend server is running on port : " + configs.BACKEND_PORT);
});