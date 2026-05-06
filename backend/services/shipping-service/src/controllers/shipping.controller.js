const { ShippingRepository, VALID_SHIPMENT_STATUSES } = require("../repository/shipping.repo");

function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    ok: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      service: "shipping-service",
    },
  });
}

function failure(res, error, statusCode = 400) {
  return res.status(statusCode).json({
    ok: false,
    error: {
      message: error.message || "Unexpected error",
      timestamp: new Date().toISOString(),
    },
  });
}

class ShippingController {
  constructor() {
    this.shippingRepo = new ShippingRepository();
  }

  async health(_req, res) {
    return success(res, {
      status: "ok",
      validStatuses: VALID_SHIPMENT_STATUSES,
    });
  }

  async createShipment(req, res) {
    try {
      const shipment = this.shippingRepo.createShipment(req.body || {});
      return success(res, shipment, 201);
    } catch (error) {
      return failure(res, error, 400);
    }
  }

  async getShipmentById(req, res) {
    try {
      const shipmentId = String(req.params.shipmentId || "").trim();
      if (!shipmentId) {
        throw new Error("shipmentId is required");
      }

      const shipment = this.shippingRepo.getShipmentById(shipmentId);
      if (!shipment) {
        return failure(res, new Error("Shipment not found"), 404);
      }

      return success(res, shipment);
    } catch (error) {
      return failure(res, error, 400);
    }
  }

  async getShipmentByTrackingNumber(req, res) {
    try {
      const trackingNumber = String(req.query.trackingNumber || "").trim();
      if (!trackingNumber) {
        throw new Error("trackingNumber is required");
      }

      const shipment = this.shippingRepo.getShipmentByTrackingNumber(trackingNumber);
      if (!shipment) {
        return failure(res, new Error("Shipment not found"), 404);
      }

      return success(res, shipment);
    } catch (error) {
      return failure(res, error, 400);
    }
  }

  async updateShipmentStatus(req, res) {
    try {
      const shipmentId = String(req.params.shipmentId || "").trim();
      const status = String(req.body?.status || "").trim();
      const note = req.body?.note;

      if (!shipmentId || !status) {
        throw new Error("shipmentId and status are required");
      }

      const shipment = this.shippingRepo.updateShipmentStatus({ shipmentId, status, note });
      return success(res, shipment);
    } catch (error) {
      if (error.message === "Shipment not found") {
        return failure(res, error, 404);
      }
      return failure(res, error, 400);
    }
  }

  async listShipments(req, res) {
    try {
      const result = this.shippingRepo.listShipments({
        status: req.query.status,
        buyer: req.query.buyer,
        shopId: req.query.shopId,
        page: req.query.page,
        limit: req.query.limit,
      });

      return success(res, result);
    } catch (error) {
      return failure(res, error, 400);
    }
  }

  async stats(_req, res) {
    try {
      const stats = this.shippingRepo.getStats();
      return success(res, stats);
    } catch (error) {
      return failure(res, error, 400);
    }
  }
}

module.exports = { ShippingController };
