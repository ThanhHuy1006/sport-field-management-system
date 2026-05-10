describe("E2E - Đăng nhập theo vai trò", () => {
  it("Đăng nhập thất bại khi sai mật khẩu", () => {
    cy.visit("/login");

    cy.get('[data-cy="login-email"]').type("test4@example.com");
    cy.get('[data-cy="login-password"]').type("sai-mat-khau");
    cy.get('[data-cy="login-submit"]').click();

    cy.get('[data-cy="login-error"]').should("be.visible");
  });

  it("USER đăng nhập thành công và chuyển đến trang browse", () => {
    cy.visit("/login");

    cy.get('[data-cy="login-email"]').type("test4@example.com");
    cy.get('[data-cy="login-password"]').type("123456");
    cy.get('[data-cy="login-submit"]').click();

    cy.url().should("include", "/browse");
  });

  it("OWNER đăng nhập thành công và chuyển đến dashboard chủ sân", () => {
    cy.visit("/login");

    cy.get('[data-cy="login-email"]').type("owner@sport.local");
    cy.get('[data-cy="login-password"]').type("123456");
    cy.get('[data-cy="login-submit"]').click();

    cy.url().should("include", "/owner/dashboard");
  });

  it("ADMIN đăng nhập thành công và chuyển đến dashboard quản trị", () => {
    cy.visit("/login");

    cy.get('[data-cy="login-email"]').type("admin@sport.local");
    cy.get('[data-cy="login-password"]').type("123456");
    cy.get('[data-cy="login-submit"]').click();

    cy.url().should("include", "/admin/dashboard");
  });
});