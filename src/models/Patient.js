const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const patientSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    avatar: {
      type: String,
    },
    mobileNo: {
      type: Number,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      trim: true,
    },
    aadharNo: {
      type: Number,
      trim: true,
      required: true,
      unique: true,
    },
    aadharCard: {
      type: String,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    verified: {
      type: String,
    },
    postalCode: {
      type: Number,
    },
    medicalReports: [
      {
        date: {
          type: Date,
          required: true,
        },
        deases: {
          type: String,
          required: true,
        },
        details: {
          type: String,
          required: true,
        },
        medicines: {
          type: String,
        },

        document: {
          type: String,
        },
        doctor: {
          type: Object,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

patientSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});

patientSchema.statics.findByCredential = async (email, password) => {
  const patient = await Patient.findOne({ email });

  if (!patient) {
    throw new Error("No valid patient found using this email...!");
  }

  if (!(await bcrypt.compare(password, patient.password))) {
    throw new Error("Wrong password for patient...!");
  }

  return patient;
};

patientSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign(
    { _id: this._id.toString(), role: "patient" },
    process.env.JWT_SECRET
  );
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

patientSchema.methods.toJSON = function () {
  const patientObject = this.toObject();

  delete patientObject.password;
  delete patientObject.tokens;

  return patientObject;
};

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
