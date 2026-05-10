/// <reference types="cypress" />

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.env(["apiUrl"]).then(({ apiUrl }) => {
    cy.request({
      method: "POST",
      url: `${apiUrl}/auth/login`,
      body: {
        email,
        password,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);

      const data = res.body.data;

      const token =
        data.accessToken ||
        data.access_token ||
        data.token;

      const user = data.user;

      expect(token).to.exist;

      window.localStorage.setItem("accessToken", token);

      if (user) {
        window.localStorage.setItem("currentUser", JSON.stringify(user));
      }
    });
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

export {};