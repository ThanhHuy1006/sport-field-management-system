import {
  ForbiddenError,
  NotFoundError,
} from "../../core/errors/index.js";
import { favoritesRepository } from "./favorites.repository.js";

function assertUserCanUseFavorites(currentUser) {
  if (!currentUser) {
    throw new ForbiddenError("Vui lòng đăng nhập để sử dụng yêu thích");
  }

  if (String(currentUser.role).toUpperCase() !== "USER") {
    throw new ForbiddenError("Chỉ khách hàng mới được sử dụng yêu thích");
  }
}

async function assertFieldCanBeFavorited(fieldId) {
  const field = await favoritesRepository.findFieldById(fieldId);

  if (!field) {
    throw new NotFoundError("Không tìm thấy sân");
  }

  if (field.status !== "active") {
    throw new ForbiddenError("Sân hiện không khả dụng để thêm vào yêu thích");
  }

  return field;
}

export const favoritesService = {
  async getMyFavorites(currentUser, query) {
    assertUserCanUseFavorites(currentUser);

    const { items, total } = await favoritesRepository.findMyFavorites(
      currentUser.id,
      query,
    );

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  async checkFavorite(currentUser, fieldId) {
    assertUserCanUseFavorites(currentUser);

    await assertFieldCanBeFavorited(fieldId);

    const favorite = await favoritesRepository.findFavorite(
      currentUser.id,
      fieldId,
    );

    return {
      field_id: fieldId,
      is_favorite: Boolean(favorite),
    };
  },

  async addFavorite(currentUser, fieldId) {
    assertUserCanUseFavorites(currentUser);

    await assertFieldCanBeFavorited(fieldId);

    return favoritesRepository.createFavorite(currentUser.id, fieldId);
  },

  async removeFavorite(currentUser, fieldId) {
    assertUserCanUseFavorites(currentUser);

    const result = await favoritesRepository.deleteFavorite(
      currentUser.id,
      fieldId,
    );

    return {
      field_id: fieldId,
      removed: result.count > 0,
    };
  },
};
