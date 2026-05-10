describe("E2E - Owner quản lý đơn đặt sân", () => {
  beforeEach(() => {
    cy.login("owner@sport.local", "123456");
  });

  it("Owner truy cập được trang quản lý đặt sân", () => {
    cy.intercept("GET", "**/api/v1/owner/bookings*", {
      middleware: false,
    }).as("getOwnerBookings");

    cy.visit("/owner/schedule");

    cy.get('[data-cy="owner-bookings-page"]').should("be.visible");
    cy.get('[data-cy="owner-bookings-title"]').should(
      "contain",
      "Quản Lý Đặt Sân",
    );

    cy.wait("@getOwnerBookings");

    cy.get('[data-cy="owner-bookings-schedule-manager"]', {
      timeout: 10000,
    }).should("be.visible");
  });
});
