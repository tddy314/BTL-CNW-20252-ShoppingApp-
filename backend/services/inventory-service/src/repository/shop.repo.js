import { supabaseUsers, supabaseAdmin } from "../config/database/supabase.config.js";

const SHOP_TABLE = "shop";
const PROFILE_TABLE = "profile";

function assertData(data, error) {
    if (error) {
        throw new Error(error.message);
    }
    if (!data) {
        throw new Error("Shop not found");
    }
}

export class ShopRepository {
    async createShop({
        owner,
        shop_name,
        shop_bank_account,
        shop_bank_account_number,
    }) {
        if (!owner || !shop_name) {
            throw new Error("Missing required fields: owner, shop_name");
        }
        if (!shop_bank_account || !shop_bank_account_number) {
            throw new Error("Missing required fields: shop_bank_account, shop_bank_account_number");
        }

        const payload = {
            owner,
            shop_name,
            shop_bank_account,
            shop_bank_account_number,
        };

        const { data, error } = await supabaseAdmin
            .from(SHOP_TABLE)
            .insert(payload)
            .select()
            .single();

        assertData(data, error);
        return data;
    }

    async deleteShop({ shop_id, owner }) {
        if (!shop_id || !owner) {
            throw new Error("shop_id and owner are required");
        }

        // Verify the shop exists and belongs to the owner
        const { data: existingShop, error: findError } = await supabaseUsers
            .from(SHOP_TABLE)
            .select("id, owner")
            .eq("id", shop_id)
            .single();

        assertData(existingShop, findError);

        if (existingShop.owner !== owner) {
            throw new Error("Only the shop owner can delete this shop");
        }

        const { data, error } = await supabaseAdmin
            .from(SHOP_TABLE)
            .delete()
            .eq("id", shop_id)
            .eq("owner", owner)
            .select()
            .single();

        assertData(data, error);
        return data;
    }

    async updateShopBankInfo({
        shop_id,
        owner,
        shop_bank_account,
        shop_bank_account_number,
    }) {
        if (!shop_id || !owner) {
            throw new Error("shop_id and owner are required");
        }
        if (!shop_bank_account && !shop_bank_account_number) {
            throw new Error("At least one field must be provided: shop_bank_account, shop_bank_account_number");
        }

        // Verify the shop exists and belongs to the owner
        const { data: existingShop, error: findError } = await supabaseUsers
            .from(SHOP_TABLE)
            .select("id, owner")
            .eq("id", shop_id)
            .single();

        assertData(existingShop, findError);

        if (existingShop.owner !== owner) {
            throw new Error("Only the shop owner can update this shop");
        }

        const updates = {};
        if (shop_bank_account) updates.shop_bank_account = shop_bank_account;
        if (shop_bank_account_number) updates.shop_bank_account_number = shop_bank_account_number;

        const { data, error } = await supabaseAdmin
            .from(SHOP_TABLE)
            .update(updates)
            .eq("id", shop_id)
            .eq("owner", owner)
            .select()
            .single();

        assertData(data, error);
        return data;
    }

    async updateShopInfo({
        shop_id,
        owner,
        shop_name,
        shop_img,
    }) {
        if (!shop_id || !owner) {
            throw new Error("shop_id and owner are required");
        }

        if (shop_name === undefined && shop_img === undefined) {
            throw new Error("At least one field must be provided: shop_name, shop_img");
        }

        const { data: existingShop, error: findError } = await supabaseUsers
            .from(SHOP_TABLE)
            .select("id, owner")
            .eq("id", shop_id)
            .single();

        assertData(existingShop, findError);

        if (existingShop.owner !== owner) {
            throw new Error("Only the shop owner can update this shop");
        }

        const updates = {};
        if (shop_name !== undefined) {
            updates.shop_name = String(shop_name).trim();
        }
        if (shop_img !== undefined) {
            updates.shop_img = shop_img || null;
        }

        const { data, error } = await supabaseAdmin
            .from(SHOP_TABLE)
            .update(updates)
            .eq("id", shop_id)
            .eq("owner", owner)
            .select()
            .single();

        assertData(data, error);
        return data;
    }

    async getShopsByOwner({ owner, page, limit }) {
        if (!owner) {
            throw new Error("owner is required");
        }

        const normalizedPage = Number(page) || 1;
        const normalizedLimit = Number(limit) || 10;

        const start = (normalizedPage - 1) * normalizedLimit;
        const end = start + normalizedLimit - 1;

        const { data, error, count } = await supabaseUsers
            .from(SHOP_TABLE)
            .select("*", { count: "exact" })
            .eq("owner", owner)
            .order("created_at", { ascending: false })
            .range(start, end);

        if (error) {
            throw new Error(error.message);
        }

        const totalItems = count || 0;

        return {
            currentPage: normalizedPage,
            limit: normalizedLimit,
            totalItems,
            totalPages: Math.max(1, Math.ceil(totalItems / normalizedLimit)),
            items: data || [],
        };
    }

    async getShopById({ shop_id }) {
        if (!shop_id) {
            throw new Error("shop_id is required");
        }

        const { data, error } = await supabaseUsers
            .from(SHOP_TABLE)
            .select("*")
            .eq("id", shop_id)
            .single();

        assertData(data, error);
        return data;
    }

    async createProfile({ email, name, profile_img = null }) {
        if (!email) {
            throw new Error("email is required");
        }

        const profileName = (name || email).trim();

        const { data, error } = await supabaseAdmin
            .from(PROFILE_TABLE)
            .upsert(
                {
                    email,
                    name: profileName,
                    profile_img: profile_img || null,
                },
                { onConflict: "email" }
            )
            .select("*")
            .single();

        assertData(data, error);
        return data;
    }

    async getProfile({ email }) {
        if (!email) {
            throw new Error("email is required");
        }

        const { data, error } = await supabaseUsers
            .from(PROFILE_TABLE)
            .select("*")
            .eq("email", email)
            .single();

        assertData(data, error);
        return data;
    }

    async updateProfile({ email, name, profile_img }) {
        if (!email) {
            throw new Error("email is required");
        }

        if (name === undefined && profile_img === undefined) {
            throw new Error("at least one field must be provided: name, profile_img");
        }

        const updates = {};
        if (name !== undefined) {
            updates.name = String(name).trim();
        }
        if (profile_img !== undefined) {
            updates.profile_img = profile_img || null;
        }

        const { data, error } = await supabaseAdmin
            .from(PROFILE_TABLE)
            .update(updates)
            .eq("email", email)
            .select("*")
            .single();

        assertData(data, error);
        return data;
    }
}