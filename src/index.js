const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const commonRoutes = require("./routes/commonRouter");
const connectDB = require("./configs/db");

const app = express();

if (process.env.NODE_ENV === "dev") {
  require("dotenv").config();
}

// Connect to db
connectDB();

app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());

app.use("/patient", patientRoutes);
app.use("/doctor", doctorRoutes);
app.use("/admin", adminRoutes);
app.use(commonRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server is started on PORT ${process.env.PORT}`)
);
