const express = require("express");

const Patient = require("../models/Patient");

const auth = require("../middlewares/userAuth");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  res.send({ patient: req.patient, message: "Patient data received...!" });
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.patient.tokens = req.patient.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.patient.save();

    res.send({ message: "Logout successfully...!" });
  } catch (error) {
    res.error(400).send({ message: "Error occured during logout...!" });
  }
});

router.post("/logoutall", auth, async (req, res) => {
  try {
    req.patient.tokens = [];
    await req.patient.save();

    res.send({ message: "Logout successfully...!" });
  } catch (error) {
    res.status(400).send({ message: "Error occured during logout...!" });
  }
});

router.patch("/me", auth, async (req, res) => {
  let allowedUpdates;
  if (req.patient.verified === true) {
    allowedUpdates = ["password", "avatar"];
  } else {
    allowedUpdates = [
      "email",
      "password",
      "firstName",
      "lastName",
      "avatar",
      "dateOfBirth",
      "mobileNo",
      "aadharCard",
      "address",
      "gender",
      "city",
      "state",
      "postalCode",
      "country",
      "verified",
    ];
  }
  console.log(req.body);
  const updates = Object.keys(req.body);

  const isValidUpdate = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidUpdate) {
    throw new Error("Invalid updates for patient...!");
  }

  try {
    updates.forEach((update) => {
      req.patient[update] = req.body[update];
    });

    await req.patient.save();
    res.send({
      patient: req.patient,
      message: "Success in updating patient information...!",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.delete("/me", auth, async (req, res) => {
  try {
    await req.patient.remove();
    res.send({ message: "Patient deleted successfully...!" });
  } catch (error) {
    res.status(500).send({ message: "Error occured deleting patient...!" });
  }
});

module.exports = router;
