const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const userAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    let patient, doctor, admin;
    if (decode.role === "patient") {
      patient = await Patient.findOne({
        _id: decode._id,
        "tokens.token": token,
      });
      req.token = token;
      req.patient = patient;
      next();
    } else if (decode.role === "doctor") {
      doctor = await Doctor.findOne({
        _id: decode._id,
        "tokens.token": token,
      });
      req.token = token;
      req.doctor = doctor;
      next();
    } else if (decode.role === "admin") {
      admin = await Admin.findOne({
        _id: decode._id,
        "tokens.token": token,
      });
      req.token = token;
      req.admin = admin;
      next();
    } else throw new Error("Please authenticate and login again...!");
  } catch (error) {
    res.status(401).send(error.message);
  }
};

module.exports = userAuth;
