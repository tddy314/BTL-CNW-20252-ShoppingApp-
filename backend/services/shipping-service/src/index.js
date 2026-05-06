require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { router: shippingRouter } = require("./routes/shipping.route");

const app = express();
const PORT = process.env.PORT || 3006;

app.use(
  cors({
    origin: process.env.API_GATEWAY_URL || "http://localhost:8080",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/shipping-service", shippingRouter);

app.listen(PORT, () => {
  console.log(`Shipping Service running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/shipping-service`);
});

