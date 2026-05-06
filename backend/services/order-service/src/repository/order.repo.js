import { supabaseUsers, supabaseAdmin } from "../config/database/supabase.config.js";

const ORDER_TABLE = "order";
const PRODUCT_TABLE = "products";
const SHOP_TABLE = "shop";
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:4000/notification-service";
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function hash32(input, seed) {
    let hash = seed >>> 0;
    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
}

function normalizeIdentifierToUuid(value) {
    const normalized = String(value).trim().toLowerCase();
    if (isUuid(normalized)) {
        return normalized;
    }

    const h1 = hash32(normalized, 0x811c9dc5);
    const h2 = hash32(normalized + "-a", 0x01000193);
    const h3 = hash32(normalized + "-b", 0x9e3779b1);
    const h4 = hash32(normalized + "-c", 0x85ebca6b);
    const hex = `${h1}${h2}${h3}${h4}`.slice(0, 32);

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

async function resolveSellerShopName(productId, shopId, fallbackSeller) {
    const { data: product, error: productError } = await supabaseUsers
        .from(PRODUCT_TABLE)
        .select("shop_owner,shop_id")
        .eq("product_id", productId)
        .single();

    if (productError || !product?.shop_owner) {
        return fallbackSeller;
    }

    const targetShopId = String(shopId || product.shop_id || "").trim();
    const { data: shops, error: shopError } = await supabaseUsers
        .from(SHOP_TABLE)
        .select("id,shop_name")
        .eq("owner", product.shop_owner);

    if (shopError || !Array.isArray(shops) || shops.length === 0) {
        return fallbackSeller;
    }

    const matched = shops.find((shop) => normalizeIdentifierToUuid(String(shop.id)) === targetShopId);
    return matched?.shop_name || fallbackSeller;
}

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

async function publishNotification({
    toUserId,
    type,
    title,
    body,
    data = {},
}) {
    if(!toUserId) {
        return;
    }

    try {
        await fetch(`${NOTIFICATION_SERVICE_URL}/publish`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                toUserId,
                type,
                title,
                body,
                data,
            }),
        });
    } catch (error) {
        console.error("Failed to publish notification:", error.message);
    }
}

async function resolveShopOwnerByProductId(productId) {
    if(!productId) return null;

    const { data, error } = await supabaseUsers
        .from(PRODUCT_TABLE)
        .select("shop_owner")
        .eq("product_id", productId)
        .single();

    if(error || !data?.shop_owner) {
        return null;
    }

    return data.shop_owner;
}

async function notifyBuyerOrderCreated(order) {
    await publishNotification({
        toUserId: order.buyer,
        type: "ORDER_CREATED",
        title: `Order ${order.order_id} created`,
        body: "Your order has been created successfully.",
        data: {
            channel: "buyer",
            targetUrl: `/orders/${order.order_id}`,
            orderId: order.order_id,
            shopId: order.shop_id,
        },
    });
}

async function notifySellerNewOrder(order) {
    const shopOwner = await resolveShopOwnerByProductId(order.product_id);
    if(!shopOwner) return;

    await publishNotification({
        toUserId: shopOwner,
        type: "SHOP_NEW_ORDER",
        title: `New order ${order.order_id}`,
        body: "Your shop has received a new order.",
        data: {
            channel: "seller",
            targetUrl: `/shop/${order.shop_id}/orders`,
            orderId: order.order_id,
            shopId: order.shop_id,
        },
    });
}

async function notifyBuyerStatusChanged(order, statusText) {
    await publishNotification({
        toUserId: order.buyer,
        type: "ORDER_STATUS_CHANGED",
        title: `Order ${order.order_id} updated`,
        body: `Your order is now ${statusText}.`,
        data: {
            channel: "buyer",
            targetUrl: `/orders/${order.order_id}`,
            orderId: order.order_id,
            shopId: order.shop_id,
            status: order.status,
        },
    });
}

async function notifyAdminsOrderAccepted(order) {
    let adminUserIds = ADMIN_USER_IDS;

    if(adminUserIds.length === 0) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();
        if(error) {
            console.error("Failed to resolve admin users:", error.message);
            return;
        }

        adminUserIds = (data?.users || [])
            .filter((user) => user?.user_metadata?.role === "admin")
            .map((user) => String(user.email || "").trim())
            .filter(Boolean);
    }

    if(adminUserIds.length === 0) {
        console.warn("No admin user ids available for admin notifications");
        return;
    }

    await Promise.all(
        adminUserIds.map((adminUserId) =>
            publishNotification({
                toUserId: adminUserId,
                type: "ADMIN_ORDER_ACCEPTED",
                title: `Order ${order.order_id} accepted by seller`,
                body: "A shop owner accepted a new order. Ready for admin shipping flow.",
                data: {
                    channel: "admin",
                    targetUrl: "/admin/in-progress-orders",
                    orderId: order.order_id,
                    shopId: order.shop_id,
                    status: order.status,
                },
            })
        )
    );
}

async function notifySellerOrderCancelledByBuyer(order) {
    const shopOwner = await resolveShopOwnerByProductId(order.product_id);
    if(!shopOwner) return;

    await publishNotification({
        toUserId: shopOwner,
        type: "SHOP_ORDER_CANCELLED_BY_BUYER",
        title: `Order ${order.order_id} cancelled by buyer`,
        body: "A buyer cancelled an order from your shop.",
        data: {
            channel: "seller",
            targetUrl: `/shop/${order.shop_id}/orders`,
            orderId: order.order_id,
            shopId: order.shop_id,
            status: order.status,
        },
    });
}

async function notifyAdminsOrderCancelledByBuyer(order) {
    let adminUserIds = ADMIN_USER_IDS;

    if(adminUserIds.length === 0) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();
        if(error) {
            console.error("Failed to resolve admin users:", error.message);
            return;
        }

        adminUserIds = (data?.users || [])
            .filter((user) => user?.user_metadata?.role === "admin")
            .map((user) => String(user.email || "").trim())
            .filter(Boolean);
    }

    if(adminUserIds.length === 0) {
        console.warn("No admin user ids available for admin notifications");
        return;
    }

    await Promise.all(
        adminUserIds.map((adminUserId) =>
            publishNotification({
                toUserId: adminUserId,
                type: "ADMIN_ORDER_CANCELLED_BY_BUYER",
                title: `Order ${order.order_id} cancelled by buyer`,
                body: "A buyer cancelled an order. Please review impact in admin flow.",
                data: {
                    channel: "admin",
                    targetUrl: "/admin/in-progress-orders",
                    orderId: order.order_id,
                    shopId: order.shop_id,
                    status: order.status,
                },
            })
        )
    );
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

        const resolvedSeller = await resolveSellerShopName(product_id, shop_id, seller);

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
            seller: resolvedSeller,
            shop_id,
        };

        const { data, error } = await supabaseAdmin
            .from(ORDER_TABLE)
            .insert(payload)
            .select()
            .single();

        assertData(data, error);
        await notifyBuyerOrderCreated(data);
        await notifySellerNewOrder(data);
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
        await notifySellerOrderCancelledByBuyer(data);
        await notifyAdminsOrderCancelledByBuyer(data);
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
        await notifyBuyerStatusChanged(data, "accepted");
        await notifyAdminsOrderAccepted(data);
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
        await notifyBuyerStatusChanged(data, "rejected");
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
        await notifyBuyerStatusChanged(data, "shipped");
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

        const deliveredQuantity = Number(data.quantity || 0);
        if (data.product_id && deliveredQuantity > 0) {
            const { data: productRow, error: productFindError } = await supabaseUsers
                .from(PRODUCT_TABLE)
                .select("product_id,sold_count")
                .eq("product_id", data.product_id)
                .single();

            if (productFindError) {
                throw new Error(productFindError.message);
            }

            const currentSoldCount = Number(productRow?.sold_count || 0);
            const { error: productUpdateError } = await supabaseAdmin
                .from(PRODUCT_TABLE)
                .update({ sold_count: currentSoldCount + deliveredQuantity })
                .eq("product_id", data.product_id);

            if (productUpdateError) {
                throw new Error(productUpdateError.message);
            }
        }

        await notifyBuyerStatusChanged(data, "delivered");
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
