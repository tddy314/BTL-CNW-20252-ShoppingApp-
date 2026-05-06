const shipments = new Map();

const VALID_SHIPMENT_STATUSES = [
  "created",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "delivery_failed",
  "returned",
  "cancelled",
];

function nowIso() {
  return new Date().toISOString();
}

function buildId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return NaN;
  }
  return Math.round(num * 100) / 100;
}

function calculateShippingFee({ distanceKm, weightKg, fragile, express }) {
  const baseFee = 1.5;
  const distanceFee = normalizeNumber(distanceKm) * 0.35;
  const weightFee = normalizeNumber(weightKg) * 0.9;
  const fragileFee = fragile ? 1.2 : 0;
  const expressFee = express ? 2.5 : 0;

  return Math.max(0, Math.round((baseFee + distanceFee + weightFee + fragileFee + expressFee) * 100) / 100);
}

class ShippingRepository {
  createShipment(payload) {
    const {
      orderId,
      buyer,
      receiver,
      phone,
      address,
      district,
      city,
      country = process.env.DEFAULT_COUNTRY || "VN",
      shopId,
      seller,
      packageInfo = {},
      shippingOption = {},
    } = payload || {};

    if (!orderId || !buyer || !receiver || !phone || !address || !city || !shopId) {
      throw new Error("Missing required fields: orderId, buyer, receiver, phone, address, city, shopId");
    }

    const weightKg = normalizeNumber(packageInfo.weightKg ?? 0.5);
    const lengthCm = normalizeNumber(packageInfo.lengthCm ?? 20);
    const widthCm = normalizeNumber(packageInfo.widthCm ?? 15);
    const heightCm = normalizeNumber(packageInfo.heightCm ?? 10);
    const declaredValue = normalizeNumber(packageInfo.declaredValue ?? 0);
    const distanceKm = normalizeNumber(shippingOption.distanceKm ?? 5);
    const fragile = Boolean(shippingOption.fragile);
    const express = Boolean(shippingOption.express);

    if (weightKg <= 0 || lengthCm <= 0 || widthCm <= 0 || heightCm <= 0) {
      throw new Error("Package dimensions and weight must be positive numbers");
    }

    const shipmentId = buildId("ship");
    const trackingNumber = buildId("trk").toUpperCase();
    const fee = calculateShippingFee({ distanceKm, weightKg, fragile, express });
    const carrier = shippingOption.carrier || process.env.DEFAULT_CARRIER || "FASTEXPRESS";

    const shipment = {
      shipmentId,
      trackingNumber,
      orderId,
      buyer,
      seller: seller || null,
      shopId,
      receiver,
      phone,
      address,
      district: district || null,
      city,
      country,
      carrier,
      status: "created",
      fee,
      etaDays: express ? 1 : 3,
      packageInfo: {
        weightKg,
        lengthCm,
        widthCm,
        heightCm,
        declaredValue,
      },
      shippingOption: {
        distanceKm,
        fragile,
        express,
      },
      timeline: [
        {
          status: "created",
          at: nowIso(),
          note: "Shipment created in shipping service",
        },
      ],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    shipments.set(shipmentId, shipment);
    return shipment;
  }

  getShipmentById(shipmentId) {
    return shipments.get(shipmentId) || null;
  }

  getShipmentByTrackingNumber(trackingNumber) {
    for (const shipment of shipments.values()) {
      if (shipment.trackingNumber === trackingNumber) {
        return shipment;
      }
    }
    return null;
  }

  updateShipmentStatus({ shipmentId, status, note }) {
    const shipment = this.getShipmentById(shipmentId);
    if (!shipment) {
      throw new Error("Shipment not found");
    }

    if (!VALID_SHIPMENT_STATUSES.includes(status)) {
      throw new Error(`Invalid shipment status: ${status}`);
    }

    shipment.status = status;
    shipment.updatedAt = nowIso();
    shipment.timeline.push({
      status,
      at: nowIso(),
      note: note || null,
    });

    return shipment;
  }

  listShipments({ status, buyer, shopId, page = 1, limit = 10 }) {
    const normalizedPage = Math.max(1, Number(page) || 1);
    const normalizedLimit = Math.max(1, Math.min(50, Number(limit) || 10));

    let items = Array.from(shipments.values());
    if (status) {
      items = items.filter((item) => item.status === status);
    }
    if (buyer) {
      items = items.filter((item) => item.buyer === buyer);
    }
    if (shopId) {
      items = items.filter((item) => item.shopId === shopId);
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / normalizedLimit));
    const currentPage = Math.min(normalizedPage, totalPages);

    const start = (currentPage - 1) * normalizedLimit;
    const pagedItems = items.slice(start, start + normalizedLimit);

    return {
      currentPage,
      limit: normalizedLimit,
      totalItems,
      totalPages,
      items: pagedItems,
    };
  }

  getStats() {
    const stats = {
      total: 0,
      created: 0,
      picked_up: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      delivery_failed: 0,
      returned: 0,
      cancelled: 0,
      totalFee: 0,
    };

    for (const shipment of shipments.values()) {
      stats.total += 1;
      stats.totalFee = Math.round((stats.totalFee + Number(shipment.fee || 0)) * 100) / 100;
      if (typeof stats[shipment.status] === "number") {
        stats[shipment.status] += 1;
      }
    }

    return stats;
  }
}

module.exports = {
  ShippingRepository,
  VALID_SHIPMENT_STATUSES,
};
