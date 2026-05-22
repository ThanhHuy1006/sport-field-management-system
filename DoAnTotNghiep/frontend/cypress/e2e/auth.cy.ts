describe("E2E - Đăng nhập theo vai trò", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit("/login");

    cy.get('[data-cy="login-email"]', { timeout: 10000 })
      .should("be.visible")
      .and("not.be.disabled");

    cy.get('[data-cy="login-password"]', { timeout: 10000 })
      .should("be.visible")
      .and("not.be.disabled");
  });

  const login = (email: string, password: string) => {
    cy.get('[data-cy="login-email"]')
      .clear()
      .type(email);

    cy.get('[data-cy="login-password"]')
      .clear()
      .type(password);

    cy.get('[data-cy="login-submit"]')
      .should("be.visible")
      .and("not.be.disabled")
      .click();
  };

  it("Đăng nhập thất bại khi sai mật khẩu", () => {
    login("test4@example.com", "sai-mat-khau");

    cy.get('[data-cy="login-error"]', { timeout: 10000 })
      .should("be.visible");
  });

  it("USER đăng nhập thành công và chuyển đến trang browse", () => {
    login("test4@example.com", "123456");

    cy.location("pathname", { timeout: 10000 })
      .should("include", "/browse");
  });

  it("OWNER đăng nhập thành công và chuyển đến dashboard chủ sân", () => {
    login("owner@sport.local", "123456");

    cy.location("pathname", { timeout: 10000 })
      .should("include", "/owner/dashboard");
  });

  it("ADMIN đăng nhập thành công và chuyển đến dashboard quản trị", () => {
    login("admin@sport.local", "123456");

    cy.location("pathname", { timeout: 10000 })
      .should("include", "/admin/dashboard");
  });
});