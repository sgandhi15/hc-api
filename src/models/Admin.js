const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const adminSchema = mongoose.Schema(
  {
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
    aadharNo: {
      type: Number,
      trim: true,
      required: true,
      unique: true,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});

adminSchema.statics.findByCredential = async (email, password) => {
  const admin = await Admin.findOne({ email });

  if (!admin) {
    throw new Error("No valid admin found using this email...!");
  }

  if (!(await bcrypt.compare(password, admin.password))) {
    throw new Error("Wrong password for admin...!");
  }

  return admin;
};

adminSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign(
    { _id: this._id.toString(), role: "admin" },
    process.env.JWT_SECRET
  );
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
