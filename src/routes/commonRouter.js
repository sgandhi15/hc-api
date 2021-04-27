const express = require("express");

const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

const auth = require("../middlewares/userAuth");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    if (req.body.role === "patient") {
      const patient = await Patient.findByCredential(
        req.body.email,
        req.body.password
      );
      const token = await patient.generateAuthToken();
      res.status(201).send({
        patient,
        token,
        role: req.body.role,
        message: "Patient login success...!",
      });
    } else if (req.body.role === "doctor") {
      const doctor = await Doctor.findByCredential(
        req.body.email,
        req.body.password
      );
      const token = await doctor.generateAuthToken();
      res.send({
        doctor,
        token,
        role: req.body.role,
        message: "Doctor login Success...!",
      });
    } else if (req.body.role === "admin") {
      const admin = await Admin.findByCredential(
        req.body.email,
        req.body.password
      );
      const token = await admin.generateAuthToken();
      res.send({
        admin,
        token,
        role: req.body.role,
        message: "Admin login Success...!",
      });
    } else throw new Error("Please enter valid role for login...!");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/signup", async (req, res) => {
  try {
    if (req.body.role === "patient") {
      const patient = new Patient(req.body);
      await patient.save();
      const token = await patient.generateAuthToken();
      res.send({
        patient,
        token,
        role: req.body.role,
        message: "Patient signup success...!",
      });
    } else if (req.body.role === "doctor") {
      const doctor = new Doctor(req.body);
      await doctor.save();
      const token = await doctor.generateAuthToken();
      res.send({
        doctor,
        token,
        role: req.body.role,
        message: "Doctor signup success...!",
      });
    } else throw new Error("Please enter valid role for signup...!");
  } catch (error) {
    if (error.keyValue)
      return res
        .status(400)
        .send({
          message: `  ${Object.keys(
            error.keyValue
          )} already exist please use unique one...!`,
        });
    res.status(400).send({ message: error.message });
  }
});

router.post("/changePassword", auth, async (req, res) => {
  try {
    if (req.body.role === "patient") {
      if (!(await bcrypt.compare(req.body.password, req.patient.password))) {
        throw new Error("Please enter valid old password...!");
      }

      req.patient.password = req.body.newPassword;
      await req.patient.save();

      res.send({ message: "Password changed successfully...!" });
    } else if (req.body.role === "doctor") {
      if (!(await bcrypt.compare(req.body.password, req.doctor.password))) {
        throw new Error("Please enter valid old password...!");
      }

      req.doctor.password = req.body.newPassword;
      await req.doctor.save();
      res.send({ message: "Password changed successfully...!" });
    } else if (req.body.role === "admin") {
      if (!(await bcrypt.compare(req.body.password, req.admin.password))) {
        throw new Error("Please enter valid old password...!");
      }

      req.admin.password = req.body.newPassword;
      await req.admin.save();
      res.send({ message: "Password changed successfully...!" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/forget", async (req, res) => {
  try {
    if (req.body.data.role === "patient") {
      const patient = await Patient.findOne({
        aadharNo: req.body.data.aadharNo,
      });

      if (!patient)
        throw new Error("No patient found with this aadhar number...!");

      if (
        patient.dateOfBirth.getTime() !==
        new Date(req.body.data.dateOfBirth).getTime()
      ) {
        throw new Error("Please enter valid date of birth...!");
      }
      patient.password = req.body.data.password;
      await patient.save();

      res.send({ message: "Patient password changed successfully...!" });
    } else if (req.body.data.role === "doctor") {
      const doctor = await Doctor.findOne({
        aadharNo: req.body.data.aadharNo,
      });
      if (!doctor)
        throw new Error("No doctor found with this aadhar number...!");
      if (!(doctor.dateOfBirth !== req.body.dateOfBirth)) {
        throw new Error("Please enter valid date of birth...!");
      }

      doctor.password = req.body.data.password;
      await doctor.save();

      res.send({ message: "Doctor password changed successfully...!" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
