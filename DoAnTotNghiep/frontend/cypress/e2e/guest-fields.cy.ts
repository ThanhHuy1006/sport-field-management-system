describe("E2E - Guest xem danh sách sân", () => {
  it("Guest truy cập trang danh sách sân và xem được danh sách sân", () => {
    cy.intercept("GET", "**/api/v1/fields*").as("getFields");

    cy.visit("/browse");

    cy.wait("@getFields");

    cy.get('[data-cy="field-card"]').should("have.length.greaterThan", 0);
    cy.get('[data-cy="fields-result-count"]').should("be.visible");
  });

  it("Hiển thị thông báo khi không tìm thấy sân phù hợp", () => {
    cy.visit("/browse?q=ten-san-khong-ton-tai-xyz");

    cy.get('[data-cy="fields-empty"]').should("be.visible");
  });
});