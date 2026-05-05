import { supabaseAdmin, supabaseUsers } from "../config/database/supabase.config.js";

const REVIEW_TABLE = "review";
const PRODUCT_TABLE = "products";

function normalizeRating(value) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) {
    throw new Error("rating must be a number from 0 to 5");
  }
  if (rating < 0 || rating > 5) {
    throw new Error("rating must be between 0 and 5");
  }
  if (!Number.isInteger(rating)) {
    throw new Error("rating must be an integer from 0 to 5");
  }
  return rating;
}

function normalizePagination(page, limit) {
  const normalizedPage = Number(page) || 1;
  const normalizedLimit = Number(limit) || 10;
  if (!Number.isInteger(normalizedPage) || normalizedPage <= 0) {
    throw new Error("page must be a positive integer");
  }
  if (!Number.isInteger(normalizedLimit) || normalizedLimit <= 0) {
    throw new Error("limit must be a positive integer");
  }
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    start: (normalizedPage - 1) * normalizedLimit,
    end: (normalizedPage - 1) * normalizedLimit + normalizedLimit - 1,
  };
}

function toOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

export class ReviewRepository {
  async addReview({ product_id, user_email, comment, rating }) {
    if (!product_id || !user_email || !comment?.trim()) {
      throw new Error("product_id, user_email and comment are required");
    }

    const normalizedRating = normalizeRating(rating);

    const { data, error } = await supabaseAdmin
      .from(REVIEW_TABLE)
      .insert({
        product_id,
        user_email,
        comment: comment.trim(),
        rating: normalizedRating,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getReviewsByProduct({ product_id, page, limit }) {
    if (!product_id) {
      throw new Error("product_id is required");
    }

    const pagination = normalizePagination(page, limit);

    const { data, error, count } = await supabaseUsers
      .from(REVIEW_TABLE)
      .select("*", { count: "exact" })
      .eq("product_id", product_id)
      .order("created_at", { ascending: false })
      .range(pagination.start, pagination.end);

    if (error) {
      throw new Error(error.message);
    }

    return {
      currentPage: pagination.page,
      limit: pagination.limit,
      totalItems: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / pagination.limit)),
      items: data || [],
    };
  }

  async getProductRating({ product_id }) {
    if (!product_id) {
      throw new Error("product_id is required");
    }

    const { data, error } = await supabaseUsers
      .from(REVIEW_TABLE)
      .select("rating")
      .eq("product_id", product_id);

    if (error) {
      throw new Error(error.message);
    }

    const ratings = (data || []).map((item) => Number(item.rating)).filter((value) => Number.isFinite(value));
    const totalReviews = ratings.length;
    const average = totalReviews > 0 ? toOneDecimal(ratings.reduce((sum, value) => sum + value, 0) / totalReviews) : 0;

    return {
      product_id,
      average_rating: average,
      total_reviews: totalReviews,
    };
  }

  async getShopRating({ shop_id }) {
    if (!shop_id) {
      throw new Error("shop_id is required");
    }

    const { data: products, error: productsError } = await supabaseUsers
      .from(PRODUCT_TABLE)
      .select("product_id")
      .eq("shop_id", shop_id);

    if (productsError) {
      throw new Error(productsError.message);
    }

    const productIds = (products || []).map((product) => product.product_id).filter(Boolean);
    if (productIds.length === 0) {
      return {
        shop_id,
        average_rating: 0,
        total_reviews: 0,
      };
    }

    const { data: reviews, error: reviewsError } = await supabaseUsers
      .from(REVIEW_TABLE)
      .select("rating")
      .in("product_id", productIds);

    if (reviewsError) {
      throw new Error(reviewsError.message);
    }

    const ratings = (reviews || []).map((item) => Number(item.rating)).filter((value) => Number.isFinite(value));
    const totalReviews = ratings.length;
    const average = totalReviews > 0 ? toOneDecimal(ratings.reduce((sum, value) => sum + value, 0) / totalReviews) : 0;

    return {
      shop_id,
      average_rating: average,
      total_reviews: totalReviews,
    };
  }
}
