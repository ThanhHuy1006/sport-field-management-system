describe("E2E - Xem chi tiết sân", () => {
  it("Guest xem được trang chi tiết sân", () => {
    cy.env(["apiUrl"]).then(({ apiUrl }) => {
      cy.request(`${apiUrl}/fields`).then((res) => {
        const data = res.body.data;

        const firstField =
          Array.isArray(data)
            ? data[0]
            : data.items
              ? data.items[0]
              : data.fields
                ? data.fields[0]
                : null;

        expect(firstField).to.exist;

        const fieldId = firstField.id;

        cy.visit(`/field/${fieldId}`);

        cy.get('[data-cy="field-detail-name"]').should("be.visible");
        cy.get('[data-cy="field-detail-price"]').should("be.visible");
        cy.get('[data-cy="field-detail-location"]').should("be.visible");
        cy.get('[data-cy="field-booking-card"]').should("be.visible");
      });
    });
  });

  it("Guest bấm đặt sân thì chuyển sang trang booking", () => {
    cy.env(["apiUrl"]).then(({ apiUrl }) => {
      cy.request(`${apiUrl}/fields`).then((res) => {
        const data = res.body.data;

        const firstField =
          Array.isArray(data)
            ? data[0]
            : data.items
              ? data.items[0]
              : data.fields
                ? data.fields[0]
                : null;

        expect(firstField).to.exist;

        const fieldId = firstField.id;

        cy.visit(`/field/${fieldId}`);

        cy.get('[data-cy="go-to-booking-button"]').click();

        cy.url().should("include", `/booking/${fieldId}`);
      });
    });
  });
});