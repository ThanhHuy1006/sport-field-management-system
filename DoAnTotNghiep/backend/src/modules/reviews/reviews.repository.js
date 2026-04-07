import prisma from "../../config/prisma.js";

export const reviewsRepository = {
  findBookingForReview(userId, bookingId) {
    return prisma.bookings.findFirst({
      where: {
        id: bookingId,
        user_id: userId,
      },
      select: {
        id: true,
        user_id: true,
        field_id: true,
        status: true,
      },
    });
  },

  findReviewByBookingId(bookingId) {
    return prisma.reviews.findFirst({
      where: { booking_id: bookingId },
    });
  },

  createReview(data) {
    return prisma.reviews.create({
      data,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
        fields: {
          select: {
            id: true,
            field_name: true,
          },
        },
      },
    });
  },

  findMyReviewById(userId, reviewId) {
    return prisma.reviews.findFirst({
      where: {
        id: reviewId,
        user_id: userId,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
        fields: {
          select: {
            id: true,
            field_name: true,
          },
        },
      },
    });
  },

  updateMyReview(reviewId, data) {
    return prisma.reviews.update({
      where: { id: reviewId },
      data,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
        fields: {
          select: {
            id: true,
            field_name: true,
          },
        },
      },
    });
  },

  hideMyReview(reviewId) {
    return prisma.reviews.update({
      where: { id: reviewId },
      data: {
        visible: false,
      },
    });
  },

  findOwnerReviews(ownerId) {
    return prisma.reviews.findMany({
      where: {
        visible: true,
        fields: {
          owner_id: ownerId,
        },
      },
      orderBy: { created_at: "desc" },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
        fields: {
          select: {
            id: true,
            field_name: true,
          },
        },
      },
    });
  },

  findOwnerReviewById(ownerId, reviewId) {
    return prisma.reviews.findFirst({
      where: {
        id: reviewId,
        fields: {
          owner_id: ownerId,
        },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
        fields: {
          select: {
            id: true,
            field_name: true,
          },
        },
      },
    });
  },

  replyOwnerReview(reviewId, reply_text) {
    return prisma.reviews.update({
      where: { id: reviewId },
      data: {
        reply_text,
        reply_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
        fields: {
          select: {
            id: true,
            field_name: true,
          },
        },
      },
    });
  },
};