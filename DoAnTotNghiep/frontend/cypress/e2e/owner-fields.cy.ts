describe("E2E - Owner quản lý sân", () => {
  beforeEach(() => {
    cy.login("owner@sport.local", "123456");
  });

  it("Owner truy cập trang quản lý sân", () => {
    cy.intercept("GET", "**/api/v1/owner/fields*").as("getOwnerFields");

    cy.visit("/owner/fields");

    cy.wait("@getOwnerFields");
    cy.get('[data-cy="owner-fields-page"]').should("be.visible");
    cy.get('[data-cy="owner-fields-result-count"]').should("be.visible");
  });

  it("Owner xem được danh sách sân hoặc trạng thái chưa có sân", () => {
    cy.intercept("GET", "**/api/v1/owner/fields*").as("getOwnerFields");

    cy.visit("/owner/fields");

    cy.wait("@getOwnerFields");

    cy.get("body").then(($body) => {
      const hasFieldCards = $body.find('[data-cy="owner-field-card"]').length > 0;

      if (hasFieldCards) {
        cy.get('[data-cy="owner-field-card"]').should("have.length.greaterThan", 0);
        cy.get('[data-cy="owner-field-name"]').first().should("be.visible");
        cy.get('[data-cy="owner-field-status"]').first().should("be.visible");
      } else {
        cy.get('[data-cy="owner-fields-empty"]').should("be.visible");
      }
    });
  });

  it("Owner tìm kiếm sân không tồn tại thì hiển thị không có kết quả", () => {
    cy.intercept("GET", "**/api/v1/owner/fields*").as("getOwnerFields");

    cy.visit("/owner/fields");

    cy.wait("@getOwnerFields");

    cy.get("body").then(($body) => {
      const hasFieldCards = $body.find('[data-cy="owner-field-card"]').length > 0;

      if (hasFieldCards) {
        cy.get('[data-cy="owner-field-search-input"]').type("ten-san-khong-ton-tai-xyz");
        cy.get('[data-cy="owner-fields-no-result"]').should("be.visible");
      } else {
        cy.get('[data-cy="owner-fields-empty"]').should("be.visible");
      }
    });
  });

  it("Owner bấm thêm sân và chuyển sang trang thêm sân", () => {
    cy.visit("/owner/fields");

    cy.get('[data-cy="owner-add-field-button"]').click();

    cy.url().should("include", "/owner/fields/new");
  });

  it("Owner bấm sửa sân đầu tiên và chuyển sang trang chỉnh sửa", () => {
    cy.intercept("GET", "**/api/v1/owner/fields*").as("getOwnerFields");

    cy.visit("/owner/fields");

    cy.wait("@getOwnerFields");

    cy.get("body").then(($body) => {
      const hasFieldCards = $body.find('[data-cy="owner-field-card"]').length > 0;

      if (hasFieldCards) {
        cy.get('[data-cy="owner-field-card"]')
          .first()
          .within(() => {
            cy.get('[data-cy="owner-edit-field-button"]').click();
          });

        cy.url().should("include", "/owner/fields/");
        cy.url().should("include", "/edit");
      } else {
        cy.get('[data-cy="owner-fields-empty"]').should("be.visible");
      }
    });
  });
});
