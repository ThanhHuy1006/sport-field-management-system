import { apiRequest } from "@/lib/api-client";

export type GetOwnerRescheduleRequestsParams = {
  page?: number;
  limit?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
};

export async function getOwnerRescheduleRequests(
  params: GetOwnerRescheduleRequestsParams = {},
) {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);

  const query = searchParams.toString();

  return apiRequest(
    `/owner/bookings/reschedule-requests${query ? `?${query}` : ""}`,
    {
      method: "GET",
    },
  );
}