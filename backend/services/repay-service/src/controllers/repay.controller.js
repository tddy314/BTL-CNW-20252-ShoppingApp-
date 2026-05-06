const { RepayRepository, VALID_PLAN_STATUSES } = require("../repository/repay.repo");

function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    ok: true,
    data,
    meta: {
      service: "repay-service",
      timestamp: new Date().toISOString(),
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

class RepayController {
  constructor() {
    this.repayRepo = new RepayRepository();
  }

  async health(_req, res) {
    return success(res, {
      status: "ok",
      validPlanStatuses: VALID_PLAN_STATUSES,
    });
  }

  async createPlan(req, res) {
    try {
      const plan = this.repayRepo.createRepaymentPlan(req.body || {});
      return success(res, plan, 201);
    } catch (error) {
      return failure(res, error, 400);
    }
  }

  async getPlanById(req, res) {
    try {
      const planId = String(req.params.planId || "").trim();
      if (!planId) throw new Error("planId is required");

      const plan = this.repayRepo.getPlanById(planId);
      if (!plan) return failure(res, new Error("Repayment plan not found"), 404);

      return success(res, plan);
    } catch (error) {
      return failure(res, error, 400);
    }
  }

  async listPlans(req, res) {
    try {
      const result = this.repayRepo.listPlans({
        status: req.query.status,
        customerId: req.query.customerId,
        orderId: req.query.orderId,
        page: req.query.page,
        limit: req.query.limit,
      });
      return success(res, result);
    } catch (error) {
      return failure(res, error, 400);
    }
  }

  async repayInstallment(req, res) {
    try {
      const planId = String(req.params.planId || "").trim();
      const installmentNo = req.body?.installmentNo;
      const amount = req.body?.amount;
      const note = req.body?.note || null;

      if (!planId || installmentNo === undefined || amount === undefined) {
        throw new Error("planId, installmentNo and amount are required");
      }

      const updated = this.repayRepo.repayInstallment({ planId, installmentNo, amount, note });
      return success(res, updated);
    } catch (error) {
      if (error.message.includes("not found")) {
        return failure(res, error, 404);
      }
      return failure(res, error, 400);
    }
  }

  async cancelPlan(req, res) {
    try {
      const planId = String(req.params.planId || "").trim();
      const note = req.body?.note || null;
      if (!planId) throw new Error("planId is required");

      const updated = this.repayRepo.cancelPlan({ planId, note });
      return success(res, updated);
    } catch (error) {
      if (error.message.includes("not found")) {
        return failure(res, error, 404);
      }
      return failure(res, error, 400);
    }
  }

  async markOverduePlans(_req, res) {
    try {
      const result = this.repayRepo.markOverduePlans();
      return success(res, result);
    } catch (error) {
      return failure(res, error, 400);
    }
  }

  async stats(_req, res) {
    try {
      return success(res, this.repayRepo.getStats());
    } catch (error) {
      return failure(res, error, 400);
    }
  }
}

module.exports = { RepayController };
