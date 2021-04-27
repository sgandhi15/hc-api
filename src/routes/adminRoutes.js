const express = require("express");

const auth = require("../middlewares/userAuth");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  res.send({ admin: req.admin, message: "Admin data received...!" });
});

router.get("/list", auth, async (req, res) => {
  try {
    const patients = await Patient.find();
    const doctors = await Doctor.find();

    if (!patients) {
      throw new Error("Error getting patient list...!");
    }
    if (!doctors) {
      throw new Error("Error getting doctor list");
    }
    if (!patients && !doctors) {
      throw new Error("Error getting patient and doctor list");
    }
    res.send({ patients, doctors, message: "" });
  } catch (error) {
    console.log({ message: error.message });
    res.status(400).send({ message: error.message });
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.admin.tokens = req.admin.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.admin.save();

    res.send({ message: "Logout successfully...!" });
  } catch (error) {
    res.status(500).send({ message: "Error occured during logout...!" });
  }
});

router.post("/logoutall", auth, async (req, res) => {
  try {
    req.admin.tokens = [];
    await req.admin.save();

    res.send({ message: "Success logout" });
  } catch (error) {
    res.status(500).send({ message: "Error occured during logout" });
  }
});

router.patch("/me", auth, async (req, res) => {
  try {
    const allowedUpdates = ["password", "avatar"];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) => {
      return allowedUpdates.includes(update);
    });
    if (!isValidUpdate) {
      throw new Error("Invalid updates for admin...!");
    }
    updates.forEach((update) => {
      req.admin[update] = req.body[update];
    });

    await req.admin.save();

    res.send({
      admin: req.admin,
      message: "Success in updating admin information...!",
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/verify/:role", auth, async (req, res) => {
  try {
    if (req.params.role === "doctor") {
      const doctor = await Doctor.findById(req.body.id);
      if (!doctor)
        throw new Error("No valid doctor found for verification...!");
      doctor.verified = true;
      await doctor.save();
      res.json({ message: "Success in verification of doctor...!" });
    } else if (req.params.role === "patient") {
      const patient = await Patient.findById(req.body.id);
      if (!patient)
        throw new Error("No valid patient found for verification...!");
      patient.verified = true;
      await patient.save();
      res.send({ message: "Success in verification of patient...!" });
    } else throw new Error("Please send valid role for verification...!");
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/delete/:role", auth, async (req, res) => {
  try {
    if (req.params.role === "doctor") {
      const doctor = await Doctor.findByIdAndRemove(req.body.id);
      if (!doctor) throw new Error("No valid doctor found for reject...!");
      res.json({ message: "Success in rejecting doctor" });
    } else if (req.params.role === "patient") {
      const patient = await Patient.findByIdAndRemove(req.body.id);
      if (!patient) throw new Error("No valid patient found for reject...!");
      res.send({ message: "Success in rejecting patient" });
    } else
      throw new Error("Please send valid role for rejection operation...!");
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete("/me", auth, async (req, res) => {
  try {
    await req.admin.remove();
    res.send({ admin: req.admin, message: "Admin deleted successfully...!" });
  } catch (error) {
    res.status(500).send({ message: "Error occured deleting admin...!" });
  }
});

module.exports = router;
