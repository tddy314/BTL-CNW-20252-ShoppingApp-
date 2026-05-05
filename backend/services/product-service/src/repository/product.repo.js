import { supabaseAdmin, supabaseUsers } from "../config/database/supabase.config.js";

const PRODUCT_TABLE = "products";

function parseNumber(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error("price must be a non-negative number");
  }
  return parsed;
}

function parseCsv(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function mapRowToProduct(row) {
  return {
    id: row.id,
    created_at: row.created_at,
    product_id: row.product_id,
    shop_id: row.shop_id,
    shop_owner: row.shop_owner,
    product_img_link: row.product_img_link,
    category: row.catagory,
    price: parseNumber(row.price),
    description: row.description,
    name: row.name,
    tag: row.tag,
    tags: parseCsv(row.tag),
    colors_list: row.colors_list,
    colors: parseCsv(row.colors_list),
    size_list: row.size_list,
    sizes: parseCsv(row.size_list),
    material_list: row.material_list,
    materials: parseCsv(row.material_list),
    sold_count: Number(row.sold_count || 0),
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

export class ProductRepository {
  async addProduct(payload) {
    const {
      shop_id,
      shop_owner,
      product_img_link,
      category,
      price,
      description,
      name,
      tag,
      colors_list,
      size_list,
      material_list,
    } = payload;

    if (!shop_id || !shop_owner || !category || !description || !name) {
      throw new Error("Missing required fields: shop_id, shop_owner, category, name, description");
    }

    const parsedPrice = parseNumber(price);

    const { data, error } = await supabaseAdmin
      .from(PRODUCT_TABLE)
      .insert({
        shop_id,
        shop_owner,
        product_img_link: product_img_link || null,
        catagory: category,
        price: String(parsedPrice),
        description: description.trim(),
        name: name.trim(),
        tag: tag || null,
        colors_list: colors_list || null,
        size_list: size_list || null,
        material_list: material_list || null,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapRowToProduct(data);
  }

  async updateProduct(payload) {
    const {
      product_id,
      shop_owner,
      product_img_link,
      category,
      price,
      description,
      name,
      tag,
      colors_list,
      size_list,
      material_list,
    } = payload;

    if (!product_id || !shop_owner) {
      throw new Error("product_id and shop_owner are required");
    }

    const { data: existing, error: findError } = await supabaseUsers
      .from(PRODUCT_TABLE)
      .select("*")
      .eq("product_id", product_id)
      .single();

    if (findError || !existing) {
      throw new Error(findError?.message || "Product not found");
    }

    if (existing.shop_owner !== shop_owner) {
      throw new Error("Only shop owner can update this product");
    }

    const updates = {};
    if (product_img_link !== undefined) updates.product_img_link = product_img_link;
    if (category !== undefined) updates.catagory = category;
    if (price !== undefined) updates.price = String(parseNumber(price));
    if (name !== undefined) updates.name = String(name).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (tag !== undefined) updates.tag = tag;
    if (colors_list !== undefined) updates.colors_list = colors_list;
    if (size_list !== undefined) updates.size_list = size_list;
    if (material_list !== undefined) updates.material_list = material_list;

    const { data, error } = await supabaseAdmin
      .from(PRODUCT_TABLE)
      .update(updates)
      .eq("product_id", product_id)
      .eq("shop_owner", shop_owner)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Unable to update product");
    }

    return mapRowToProduct(data);
  }

  async deleteProduct({ product_id, shop_owner }) {
    if (!product_id || !shop_owner) {
      throw new Error("product_id and shop_owner are required");
    }

    const { data, error } = await supabaseAdmin
      .from(PRODUCT_TABLE)
      .delete()
      .eq("product_id", product_id)
      .eq("shop_owner", shop_owner)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Product not found or not owned by this user");
    }

    return mapRowToProduct(data);
  }

  async getProductById({ product_id }) {
    if (!product_id) {
      throw new Error("product_id is required");
    }

    const { data, error } = await supabaseUsers
      .from(PRODUCT_TABLE)
      .select("*")
      .eq("product_id", product_id)
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Product not found");
    }

    return mapRowToProduct(data);
  }

  async searchProducts({
    page = 1,
    limit = 20,
    query,
    category,
    shop_id,
    shop_owner,
    min_price,
    max_price,
  }) {
    const normalizedPage = Number(page) || 1;
    const normalizedLimit = Number(limit) || 20;

    if (normalizedPage <= 0 || normalizedLimit <= 0) {
      throw new Error("page and limit must be positive integers");
    }

    const start = (normalizedPage - 1) * normalizedLimit;
    const end = start + normalizedLimit - 1;

    let supabaseQuery = supabaseUsers
      .from(PRODUCT_TABLE)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,tag.ilike.%${query}%`);
    }

    if (category) {
      supabaseQuery = supabaseQuery.eq("catagory", category);
    }

    if (shop_id) {
      supabaseQuery = supabaseQuery.eq("shop_id", shop_id);
    }

    if (shop_owner) {
      supabaseQuery = supabaseQuery.eq("shop_owner", shop_owner);
    }

    const { data, error, count } = await supabaseQuery.range(start, end);

    if (error) {
      throw new Error(error.message);
    }

    let items = (data || []).map(mapRowToProduct);
    if (min_price !== undefined) {
      const parsedMinPrice = parseNumber(min_price);
      items = items.filter((item) => item.price >= parsedMinPrice);
    }
    if (max_price !== undefined) {
      const parsedMaxPrice = parseNumber(max_price);
      items = items.filter((item) => item.price <= parsedMaxPrice);
    }

    return buildPageResult({
      items,
      count,
      page: normalizedPage,
      limit: normalizedLimit,
    });
  }
}
