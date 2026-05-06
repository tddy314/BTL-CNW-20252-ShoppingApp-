require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { router: repayRouter } = require("./routes/repay.route");

const app = express();
const PORT = process.env.PORT || 3007;

app.use(
  cors({
    origin: process.env.API_GATEWAY_URL || "http://localhost:8080",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/repay-service", repayRouter);

app.listen(PORT, () => {
  console.log(`Repay Service running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/repay-service`);
});

