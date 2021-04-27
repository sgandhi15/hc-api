const express = require("express");

const auth = require("../middlewares/userAuth");
const Doctor = require("../models/Doctor");

const Patient = require("../models/Patient");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  res.send({ doctor: req.doctor, message: "Doctor data received...!" });
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.doctor.tokens = req.doctor.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.doctor.save();

    res.send({ message: "Logout successfully...!" });
  } catch (error) {
    res
      .status(500)
      .send({ error, message: "Error in logoError occured during logout...!" });
  }
});

router.post("/logoutall", auth, async (req, res) => {
  try {
    req.doctor.tokens = [];
    await req.doctor.save();

    res.send({ message: "Logout successfully...!" });
  } catch (error) {
    res.status(500).send({ error, message: "Error occured during logout...!" });
  }
});

router.patch("/me", auth, async (req, res) => {
  try {
    let allowedUpdates;
    if (req.doctor.verified === "true") allowedUpdates = ["password", "avatar"];
    else
      allowedUpdates = [
        "firstName",
        "email",
        "password",
        "lastName",
        "avatar",
        "dateOfBirth",
        "mobileNo",
        "hospitalName",
        "hospitalAddress",
        "address",
        "city",
        "aadharCard",
        "gender",
        "licenceNo",
        "state",
        "postalCode",
        "licenceCard",
        "country",
      ];
    const updates = Object.keys(req.body);
    console.log(updates);
    const isValidUpdate = updates.every((update) => {
      return allowedUpdates.includes(update);
    });
    if (!isValidUpdate) {
      throw new Error("Invalid updates for doctor...!");
    }
    updates.forEach((update) => {
      req.doctor[update] = req.body[update];
    });

    await req.doctor.save();

    res.send({
      doctor: req.doctor,
      message: "Success in updating doctor information...!",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.delete("/me", auth, async (req, res) => {
  try {
    await req.doctor.remove();
    res.send({ message: "Doctor deleted successfully...!" });
  } catch (error) {
    res.status(500).send({ message: "Error occured deleting doctor...!" });
  }
});

router.post("/verify/:id", auth, async (req, res) => {
  try {
    if (req.params.id === "patient") {
      const patient = await Patient.findOne({ email: req.body.id });
      if (!patient) throw new Error("No patient found using this email...!");
      if (patient.verified !== "true")
        throw new Error("Patient with this email is not verified...!");
      res.send({ patient, message: "Patient data received successfully...!" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/patient", auth, async (req, res) => {
  try {
    req.body.doctor = await Doctor.findById(req.doctor._id);

    const patient = await Patient.findOne({ email: req.body.email });
    if (!patient) throw new Error("No patient found using this email...!");
    if (patient.verified !== "true")
      throw new Error("Patient with this email is not verified...!");
    patient.medicalReports = [...patient.medicalReports, req.body];

    await patient.save();
    res.send({
      message: "Success adding medical record in patient profile...!",
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
