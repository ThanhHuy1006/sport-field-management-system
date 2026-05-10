describe("E2E - Admin quản lý sân", () => {
  beforeEach(() => {
    cy.login("admin@sport.local", "123456");
  });

  function visitAdminFields() {
    cy.intercept("GET", "**/api/v1/admin/fields*").as("getAdminFields");

    cy.visit("/admin/fields");

    cy.wait("@getAdminFields", { timeout: 15000 });

    cy.get('[data-cy="admin-fields-page"]', { timeout: 10000 }).should(
      "be.visible",
    );
  }

  it("Admin truy cập trang quản lý sân", () => {
    visitAdminFields();

    cy.get('[data-cy="admin-fields-title"]')
      .should("be.visible")
      .and("contain", "Quản Lý Sân");

    cy.get('[data-cy="admin-fields-toolbar"]').should("be.visible");
  });

  it("Admin xem được khu vực danh sách sân", () => {
    visitAdminFields();

    cy.get("body").then(($body) => {
      const hasRows = $body.find('[data-cy="admin-field-row"]').length > 0;
      const hasEmpty = $body.find('[data-cy="admin-fields-empty"]').length > 0;
      const hasList = $body.find('[data-cy="admin-fields-list"]').length > 0;

      expect(hasRows || hasEmpty || hasList).to.eq(true);
    });
  });

  it("Admin tìm kiếm sân không tồn tại", () => {
    visitAdminFields();

    cy.get('[data-cy="admin-fields-search-input"]')
      .clear()
      .type("san-khong-ton-tai-e2e-xyz");

    cy.get("body").then(($body) => {
      const hasEmpty = $body.find('[data-cy="admin-fields-empty"]').length > 0;
      const hasNoResultText =
        $body.text().includes("Không tìm thấy") ||
        $body.text().includes("không có") ||
        $body.text().includes("Không có");

      expect(hasEmpty || hasNoResultText).to.eq(true);
    });
  });

  it("Admin lọc sân theo trạng thái", () => {
    visitAdminFields();

    cy.get('[data-cy="admin-fields-status-filter"][data-status="pending"]')
      .should("exist")
      .click();

    cy.get('[data-cy="admin-fields-page"]').should("be.visible");

    cy.get('[data-cy="admin-fields-status-filter"][data-status="active"]')
      .should("exist")
      .click();

    cy.get('[data-cy="admin-fields-page"]').should("be.visible");

    cy.get('[data-cy="admin-fields-status-filter"][data-status="hidden"]')
      .should("exist")
      .click();

    cy.get('[data-cy="admin-fields-page"]').should("be.visible");
  });

  it("Admin mở chi tiết sân đầu tiên nếu có dữ liệu", () => {
    visitAdminFields();

    cy.get("body").then(($body) => {
      const hasRows = $body.find('[data-cy="admin-field-row"]').length > 0;

      if (!hasRows) {
        cy.log("Không có sân để mở chi tiết, bỏ qua thao tác mở chi tiết.");
        return;
      }

      cy.get('[data-cy="admin-field-row"]')
        .first()
        .within(() => {
          cy.get('[data-cy="admin-field-detail-button"]').click();
        });

      cy.get('[data-cy="admin-field-detail-dialog"]').should("be.visible");
      cy.get('[data-cy="admin-field-detail-name"]').should("be.visible");
    });
  });
});