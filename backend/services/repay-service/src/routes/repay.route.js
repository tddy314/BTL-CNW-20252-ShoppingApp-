const express = require("express");
const { RepayController } = require("../controllers/repay.controller");

const router = express.Router();
const controller = new RepayController();

router.get("/health", controller.health.bind(controller));
router.post("/create-plan", controller.createPlan.bind(controller));
router.get("/get-plan/:planId", controller.getPlanById.bind(controller));
router.get("/list-plans", controller.listPlans.bind(controller));
router.post("/repay-installment/:planId", controller.repayInstallment.bind(controller));
router.post("/cancel-plan/:planId", controller.cancelPlan.bind(controller));
router.post("/mark-overdue", controller.markOverduePlans.bind(controller));
router.get("/stats", controller.stats.bind(controller));

module.exports = { router };
