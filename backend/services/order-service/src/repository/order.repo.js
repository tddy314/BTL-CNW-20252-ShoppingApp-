import { supabaseUsers, supabaseAdmin } from "../config/database/supabase.config.js";

const ORDER_TABLE = "order";

function isValidPayment(payment) {
    return payment === 0 || payment === 1;
}

function assertPaymentRules(payment, bank, bankNumber) {
    if(!isValidPayment(payment)) {
        throw new Error("Payment must be 0 (cash) or 1 (bank transfer)");
    }

    if(payment === 1) {
        if(!bank || !bankNumber) {
            throw new Error("Bank and bank_number are required for bank transfer");
        }
        return;
    }

    if(bank || bankNumber) {
        throw new Error("Bank and bank_number are only allowed when payment is bank transfer");
    }
}

function assertData(data, error) {
    if(error) {
        throw new Error(error.message);
    }
    if(!data) {
        throw new Error("Order not found");
    }
}

function normalizePagination(page, limit) {
    const normalizedPage = Number(page);
    const normalizedLimit = Number(limit);

    if(!Number.isInteger(normalizedPage) || normalizedPage <= 0) {
        throw new Error("page must be a positive integer");
    }

    if(!Number.isInteger(normalizedLimit) || normalizedLimit <= 0) {
        throw new Error("limit must be a positive integer");
    }

    const start = (normalizedPage - 1) * normalizedLimit;
    const end = start + normalizedLimit - 1;

    return {
        page: normalizedPage,
        limit: normalizedLimit,
        start,
        end,
    };
}

function buildPageResult({ items, count, page, limit }) {
    const totalItems = count || 0;

    return {
        currentPage: page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
        items,
    };
}

export class OrderRepository {
    async newOrder({
        product_id,
        buyer,
        color,
        size,
        payment,
        bank,
        bank_number,
        price,
        phone,
        address,
        receiver,
        quantity = 1,
        seller,
        shop_id,
    }) {
        if(!product_id || !buyer || !seller || !shop_id) {
            throw new Error("Missing required fields: product_id, buyer, seller, shop_id");
        }

        if(!phone || !address || !receiver) {
            throw new Error("Missing required receiver info: phone, address, receiver");
        }

        if(typeof price !== "number" || Number.isNaN(price) || price < 0) {
            throw new Error("Price must be a non-negative number");
        }

        if(typeof quantity !== "number" || Number.isNaN(quantity) || quantity <= 0) {
            throw new Error("Quantity must be a positive number");
        }

        assertPaymentRules(payment, bank, bank_number);

        const payload = {
            product_id,
            buyer,
            color: color ?? null,
            size: size ?? null,
            payment,
            bank: payment === 1 ? bank : null,
            bank_number: payment === 1 ? bank_number : null,
            status: "pending",
            price,
            phone,
            address,
            receiver,
            quantity,
            seller,
            shop_id,
        };

        const { data, error } = await supabaseAdmin
            .from(ORDER_TABLE)
            .insert(payload)
            .select()
            .single();

        assertData(data, error);
        return data;
    }

    async modifyOrderByBuyer({
        order_id,
        buyer,
        phone,
        address,
        receiver,
    }) {
        if(!order_id || !buyer) {
            throw new Error("order_id and buyer are required");
        }

        if(!phone && !address && !receiver) {
            throw new Error("At least one field must be provided: phone, address, receiver");
        }

        const { data: existingOrder, error: findError } = await supabaseUsers
            .from(ORDER_TABLE)
            .select("order_id,buyer,status")
            .eq("order_id", order_id)
            .single();

        assertData(existingOrder, findError);

        if(existingOrder.buyer !== buyer) {
            throw new Error("Only buyer can modify this order");
        }

        if(["shipped", "delivered", "cancelled"].includes(existingOrder.status)) {
            throw new Error("This order can no longer be modified");
        }

        const updates = {};
        if(phone) updates.phone = phone;
        if(address) updates.address = address;
        if(receiver) updates.receiver = receiver;

        const { data, error } = await supabaseAdmin
            .from(ORDER_TABLE)
            .update(updates)
            .eq("order_id", order_id)
            .eq("buyer", buyer)
            .select()
            .single();

        assertData(data, error);
        return data;
    }

    async cancelOrderByBuyer({
        order_id,
        buyer,
    }) {
        if(!order_id || !buyer) {
            throw new Error("order_id and buyer are required");
        }

        const { data: existingOrder, error: findError } = await supabaseUsers
            .from(ORDER_TABLE)
            .select("order_id,buyer,status")
            .eq("order_id", order_id)
            .single();

        assertData(existingOrder, findError);

        if(existingOrder.buyer !== buyer) {
            throw new Error("Only buyer can cancel this order");
        }

        if(["shipped", "delivered", "cancelled"].includes(existingOrder.status)) {
            throw new Error("This order can no longer be cancelled");
        }

        const { data, error } = await supabaseAdmin
            .from(ORDER_TABLE)
            .update({ status: "cancelled" })
            .eq("order_id", order_id)
            .eq("buyer", buyer)
            .select()
            .single();

        assertData(data, error);
        return data;
    }

    async sellerAcceptOrder({
        order_id,
        seller,
    }) {
        if(!order_id || !seller) {
            throw new Error("order_id and seller are required");
        }

        const { data: existingOrder, error: findError } = await supabaseUsers
            .from(ORDER_TABLE)
            .select("order_id,seller,status")
            .eq("order_id", order_id)
            .single();

        assertData(existingOrder, findError);

        if(existingOrder.seller !== seller) {
            throw new Error("Only seller can accept this order");
        }

        if(existingOrder.status !== "pending") {
            throw new Error("Seller can only accept orders that are pending");
        }

        const { data, error } = await supabaseAdmin
            .from(ORDER_TABLE)
            .update({ status: "processing" })
            .eq("order_id", order_id)
            .eq("seller", seller)
            .select()
            .single();

        assertData(data, error);
        return data;
    }

    async sellerRejectOrder({
        order_id,
        seller,
    }) {
        if(!order_id || !seller) {
            throw new Error("order_id and seller are required");
        }

        const { data: existingOrder, error: findError } = await supabaseUsers
            .from(ORDER_TABLE)
            .select("order_id,seller,status")
            .eq("order_id", order_id)
            .single();

        assertData(existingOrder, findError);

        if(existingOrder.seller !== seller) {
            throw new Error("Only seller can reject this order");
        }

        if(existingOrder.status !== "pending") {
            throw new Error("Seller can only reject orders that are pending");
        }

        const { data, error } = await supabaseAdmin
            .from(ORDER_TABLE)
            .update({ status: "cancelled" })
            .eq("order_id", order_id)
            .eq("seller", seller)
            .select()
            .single();

        assertData(data, error);
        return data;
    }

    async adminShipOrder({
        order_id,
    }) {
        if(!order_id) {
            throw new Error("order_id is required");
        }

        const { data: existingOrder, error: findError } = await supabaseUsers
            .from(ORDER_TABLE)
            .select("order_id,status")
            .eq("order_id", order_id)
            .single();

        assertData(existingOrder, findError);

        if(existingOrder.status !== "processing") {
            throw new Error("Admin can only ship orders in processing status");
        }

        const { data, error } = await supabaseAdmin
            .from(ORDER_TABLE)
            .update({ status: "shipped" })
            .eq("order_id", order_id)
            .select()
            .single();

        assertData(data, error);
        return data;
    }

    async adminDeliverOrder({
        order_id,
    }) {
        if(!order_id) {
            throw new Error("order_id is required");
        }

        const { data: existingOrder, error: findError } = await supabaseUsers
            .from(ORDER_TABLE)
            .select("order_id,status")
            .eq("order_id", order_id)
            .single();

        assertData(existingOrder, findError);

        if(existingOrder.status !== "shipped") {
            throw new Error("Admin can only deliver orders in shipped status");
        }

        const { data, error } = await supabaseAdmin
            .from(ORDER_TABLE)
            .update({ status: "delivered" })
            .eq("order_id", order_id)
            .select()
            .single();

        assertData(data, error);
        return data;
    }

    async readOrdersByBuyer({
        buyer,
        page,
        limit,
    }) {
        if(!buyer) {
            throw new Error("buyer is required");
        }

        const pagination = normalizePagination(page, limit);

        const { data, error, count } = await supabaseUsers
            .from(ORDER_TABLE)
            .select("*", { count: "exact" })
            .eq("buyer", buyer)
            .order("created_at", { ascending: false })
            .range(pagination.start, pagination.end);

        if(error) {
            throw new Error(error.message);
        }

        return buildPageResult({
            items: data || [],
            count,
            page: pagination.page,
            limit: pagination.limit,
        });
    }

    async readOrdersByShop({
        shop_id,
        page,
        limit,
    }) {
        if(!shop_id) {
            throw new Error("shop_id is required");
        }

        const pagination = normalizePagination(page, limit);

        const { data, error, count } = await supabaseUsers
            .from(ORDER_TABLE)
            .select("*", { count: "exact" })
            .eq("shop_id", shop_id)
            .order("created_at", { ascending: false })
            .range(pagination.start, pagination.end);

        if(error) {
            throw new Error(error.message);
        }

        return buildPageResult({
            items: data || [],
            count,
            page: pagination.page,
            limit: pagination.limit,
        });
    }

    async readAllOrders({
        page,
        limit,
    }) {
        const pagination = normalizePagination(page, limit);

        const { data, error, count } = await supabaseUsers
            .from(ORDER_TABLE)
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(pagination.start, pagination.end);

        if(error) {
            throw new Error(error.message);
        }

        return buildPageResult({
            items: data || [],
            count,
            page: pagination.page,
            limit: pagination.limit,
        });
    }
}
