const repaymentPlans = new Map();

const VALID_PLAN_STATUSES = [
  "draft",
  "active",
  "partially_paid",
  "fully_paid",
  "overdue",
  "cancelled",
];

function nowIso() {
  return new Date().toISOString();
}

function buildId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function toMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return NaN;
  return Math.round(num * 100) / 100;
}

function toPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return NaN;
  return Math.max(0, Math.round(num * 100) / 100);
}

function computeInstallmentSchedule({ principal, annualRate, termMonths, startedAt }) {
  const monthlyRate = annualRate / 12 / 100;
  const monthlyPayment =
    monthlyRate === 0
      ? principal / termMonths
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));

  const schedule = [];
  let remaining = principal;
  const startDate = new Date(startedAt);

  for (let monthIndex = 1; monthIndex <= termMonths; monthIndex += 1) {
    const interestAmount = remaining * monthlyRate;
    const principalAmount = monthlyPayment - interestAmount;
    remaining = Math.max(0, remaining - principalAmount);

    const dueDate = new Date(startDate);
    dueDate.setMonth(startDate.getMonth() + monthIndex);

    schedule.push({
      installmentNo: monthIndex,
      dueDate: dueDate.toISOString(),
      amount: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalAmount * 100) / 100,
      interest: Math.round(interestAmount * 100) / 100,
      remainingBalance: Math.round(remaining * 100) / 100,
      status: "unpaid",
      paidAt: null,
      paidAmount: 0,
    });
  }

  return schedule;
}

class RepayRepository {
  createRepaymentPlan(payload) {
    const {
      customerId,
      orderId,
      principalAmount,
      currency = process.env.DEFAULT_CURRENCY || "USD",
      annualInterestRate = process.env.DEFAULT_INTEREST_RATE || 6.8,
      termMonths = 6,
      startedAt = nowIso(),
      note = null,
    } = payload || {};

    if (!customerId || !orderId) {
      throw new Error("customerId and orderId are required");
    }

    const principal = toMoney(principalAmount);
    const rate = toPercent(annualInterestRate);
    const term = Number(termMonths);

    if (!principal || principal <= 0) {
      throw new Error("principalAmount must be a positive number");
    }

    if (!Number.isInteger(term) || term <= 0 || term > 84) {
      throw new Error("termMonths must be a positive integer and <= 84");
    }

    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      throw new Error("annualInterestRate must be between 0 and 100");
    }

    const planId = buildId("repay");
    const schedule = computeInstallmentSchedule({
      principal,
      annualRate: rate,
      termMonths: term,
      startedAt,
    });

    const totalPayable = schedule.reduce((sum, item) => sum + item.amount, 0);

    const plan = {
      planId,
      customerId,
      orderId,
      principalAmount: principal,
      currency: String(currency).toUpperCase(),
      annualInterestRate: rate,
      termMonths: term,
      startedAt,
      status: "active",
      note,
      totalPayable: Math.round(totalPayable * 100) / 100,
      totalPaid: 0,
      remainingAmount: Math.round(totalPayable * 100) / 100,
      schedule,
      timeline: [
        {
          action: "created",
          at: nowIso(),
          note: "Repayment plan created",
        },
      ],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    repaymentPlans.set(planId, plan);
    return plan;
  }

  getPlanById(planId) {
    return repaymentPlans.get(planId) || null;
  }

  listPlans({ status, customerId, orderId, page = 1, limit = 10 }) {
    const normalizedPage = Math.max(1, Number(page) || 1);
    const normalizedLimit = Math.max(1, Math.min(100, Number(limit) || 10));

    let items = Array.from(repaymentPlans.values());
    if (status) items = items.filter((item) => item.status === status);
    if (customerId) items = items.filter((item) => item.customerId === customerId);
    if (orderId) items = items.filter((item) => item.orderId === orderId);

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / normalizedLimit));
    const currentPage = Math.min(normalizedPage, totalPages);
    const start = (currentPage - 1) * normalizedLimit;

    return {
      currentPage,
      limit: normalizedLimit,
      totalItems,
      totalPages,
      items: items.slice(start, start + normalizedLimit),
    };
  }

  repayInstallment({ planId, installmentNo, amount, note = null }) {
    const plan = this.getPlanById(planId);
    if (!plan) {
      throw new Error("Repayment plan not found");
    }

    if (plan.status === "cancelled" || plan.status === "fully_paid") {
      throw new Error(`Cannot repay a plan in status ${plan.status}`);
    }

    const targetInstallment = plan.schedule.find((item) => item.installmentNo === Number(installmentNo));
    if (!targetInstallment) {
      throw new Error("Installment not found");
    }

    if (targetInstallment.status === "paid") {
      throw new Error("Installment already paid");
    }

    const paidAmount = toMoney(amount);
    if (!paidAmount || paidAmount <= 0) {
      throw new Error("amount must be a positive number");
    }

    if (paidAmount < targetInstallment.amount) {
      throw new Error("Partial installment payment is not allowed in this mock");
    }

    targetInstallment.status = "paid";
    targetInstallment.paidAt = nowIso();
    targetInstallment.paidAmount = paidAmount;

    plan.totalPaid = Math.round((plan.totalPaid + paidAmount) * 100) / 100;
    plan.remainingAmount = Math.max(0, Math.round((plan.totalPayable - plan.totalPaid) * 100) / 100);
    plan.updatedAt = nowIso();

    const allPaid = plan.schedule.every((item) => item.status === "paid");
    plan.status = allPaid ? "fully_paid" : "partially_paid";
    plan.timeline.push({
      action: "repayment_received",
      at: nowIso(),
      installmentNo: targetInstallment.installmentNo,
      amount: paidAmount,
      note,
    });

    return plan;
  }

  cancelPlan({ planId, note = null }) {
    const plan = this.getPlanById(planId);
    if (!plan) {
      throw new Error("Repayment plan not found");
    }

    if (plan.status === "fully_paid") {
      throw new Error("Cannot cancel a fully paid plan");
    }

    if (plan.status === "cancelled") {
      throw new Error("Plan is already cancelled");
    }

    plan.status = "cancelled";
    plan.updatedAt = nowIso();
    plan.timeline.push({
      action: "cancelled",
      at: nowIso(),
      note: note || null,
    });

    return plan;
  }

  markOverduePlans() {
    const now = new Date();
    let affected = 0;

    for (const plan of repaymentPlans.values()) {
      if (plan.status === "fully_paid" || plan.status === "cancelled") continue;

      const hasOverdueInstallment = plan.schedule.some((item) => {
        return item.status === "unpaid" && new Date(item.dueDate).getTime() < now.getTime();
      });

      if (hasOverdueInstallment) {
        plan.status = "overdue";
        plan.updatedAt = nowIso();
        plan.timeline.push({
          action: "marked_overdue",
          at: nowIso(),
          note: "Auto detected overdue installment(s)",
        });
        affected += 1;
      }
    }

    return { affected };
  }

  getStats() {
    const stats = {
      totalPlans: 0,
      active: 0,
      partially_paid: 0,
      fully_paid: 0,
      overdue: 0,
      cancelled: 0,
      totalPrincipal: 0,
      totalPayable: 0,
      totalPaid: 0,
      totalRemaining: 0,
    };

    for (const plan of repaymentPlans.values()) {
      stats.totalPlans += 1;
      stats.totalPrincipal = Math.round((stats.totalPrincipal + Number(plan.principalAmount || 0)) * 100) / 100;
      stats.totalPayable = Math.round((stats.totalPayable + Number(plan.totalPayable || 0)) * 100) / 100;
      stats.totalPaid = Math.round((stats.totalPaid + Number(plan.totalPaid || 0)) * 100) / 100;
      stats.totalRemaining = Math.round((stats.totalRemaining + Number(plan.remainingAmount || 0)) * 100) / 100;
      if (typeof stats[plan.status] === "number") {
        stats[plan.status] += 1;
      }
    }

    return stats;
  }
}

module.exports = {
  RepayRepository,
  VALID_PLAN_STATUSES,
};
