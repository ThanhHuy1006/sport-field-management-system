import { apiGet } from "@/lib/api-client";

export type FieldReviewsResponse = {
  success: boolean;
  message: string;
  data: {
    items: Array<{
      id: number;
      rating: number | null;
      comment: string | null;
      reply_text: string | null;
      reply_at: string | null;
      created_at: string | null;
      user: {
        id: number | null;
        name: string;
        avatar_url: string | null;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      averageRating: number;
      totalReviews: number;
      ratingBreakdown: Record<string, number>;
    };
  };
};

type GetFieldReviewsParams = {
  page?: number;
  limit?: number;
  rating?: number;
  sort?: "newest" | "oldest" | "rating_desc" | "rating_asc";
};

export function getFieldReviews(
  fieldId: string | number,
  params?: GetFieldReviewsParams
) {
  return apiGet<FieldReviewsResponse>(`/fields/${fieldId}/reviews`, params, {
    requireAuth: false,
  });
}