import { supabaseAdmin, supabaseUsers } from "../config/database/supabase.config.js";

const PRODUCT_TABLE = "products";
const SHOP_TABLE = "shop";

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
    shop_name: row.shop_name || row.shop_owner,
    shop_img: row.shop_img || null,
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

async function buildShopMetaMapByOwner(rows) {
  const owners = [...new Set(rows.map((row) => row.shop_owner).filter(Boolean))];
  const entries = await Promise.all(
    owners.map(async (owner) => {
      const { data, error } = await supabaseUsers
        .from(SHOP_TABLE)
        .select("id,shop_name,shop_img,owner")
        .eq("owner", owner);
      if (error || !data) {
        return [];
      }
      return data.map((shop) => ({
        key: `${owner}:${normalizeIdentifierToUuid(String(shop.id))}`,
        shop_name: shop.shop_name,
        shop_img: shop.shop_img || null,
      }));
    })
  );

  const map = new Map();
  for (const ownerEntries of entries) {
    for (const entry of ownerEntries) {
      map.set(entry.key, {
        shop_name: entry.shop_name,
        shop_img: entry.shop_img,
      });
    }
  }
  return map;
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

    const shopMetaMap = await buildShopMetaMapByOwner([data]);
    const shopMeta = shopMetaMap.get(`${data.shop_owner}:${data.shop_id}`);
    return mapRowToProduct({
      ...data,
      shop_name: shopMeta?.shop_name || data.shop_owner,
      shop_img: shopMeta?.shop_img || null,
    });
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

    const shopMetaMap = await buildShopMetaMapByOwner([data]);
    const shopMeta = shopMetaMap.get(`${data.shop_owner}:${data.shop_id}`);
    return mapRowToProduct({
      ...data,
      shop_name: shopMeta?.shop_name || data.shop_owner,
      shop_img: shopMeta?.shop_img || null,
    });
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

    const shopMetaMap = await buildShopMetaMapByOwner([data]);
    const shopMeta = shopMetaMap.get(`${data.shop_owner}:${data.shop_id}`);
    return mapRowToProduct({
      ...data,
      shop_name: shopMeta?.shop_name || data.shop_owner,
      shop_img: shopMeta?.shop_img || null,
    });
  }

  async getProductById({ product_id }) {
    if (!product_id) {
      throw new Error("product_id is required");
    }

    const normalized = String(product_id).trim();
    const isNumericId = /^[0-9]+$/.test(normalized);

    let data = null;
    let error = null;

    if (isNumericId) {
      const numericResult = await supabaseUsers
        .from(PRODUCT_TABLE)
        .select("*")
        .eq("id", Number(normalized))
        .single();

      data = numericResult.data;
      error = numericResult.error;
    } else {
      const uuidResult = await supabaseUsers
        .from(PRODUCT_TABLE)
        .select("*")
        .eq("product_id", normalized)
        .single();

      data = uuidResult.data;
      error = uuidResult.error;
    }

    if (error || !data) {
      throw new Error("Product not found");
    }

    const shopMetaMap = await buildShopMetaMapByOwner([data]);
    const shopMeta = shopMetaMap.get(`${data.shop_owner}:${data.shop_id}`);
    return mapRowToProduct({
      ...data,
      shop_name: shopMeta?.shop_name || data.shop_owner,
      shop_img: shopMeta?.shop_img || null,
    });
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

    let items = data || [];
    if (min_price !== undefined) {
      const parsedMinPrice = parseNumber(min_price);
      items = items.filter((item) => parseNumber(item.price) >= parsedMinPrice);
    }
    if (max_price !== undefined) {
      const parsedMaxPrice = parseNumber(max_price);
      items = items.filter((item) => parseNumber(item.price) <= parsedMaxPrice);
    }

    const shopMetaMap = await buildShopMetaMapByOwner(items);
    const itemsWithShopMeta = items.map((item) => {
      const shopMeta = shopMetaMap.get(`${item.shop_owner}:${item.shop_id}`);
      return mapRowToProduct({
      ...item,
      shop_name: shopMeta?.shop_name || item.shop_owner,
      shop_img: shopMeta?.shop_img || null,
    });
    });

    return buildPageResult({
      items: itemsWithShopMeta,
      count,
      page: normalizedPage,
      limit: normalizedLimit,
    });
  }
}
