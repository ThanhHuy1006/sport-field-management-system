type FieldItem = {
  id: number;
};

type SlotItem = {
  start_datetime: string;
  end_datetime: string;
  start_time: string;
  end_time: string;
  available?: boolean;
  status?: string;
  reason?: string | null;
};

type BookingCandidate = {
  fieldId: number;
  date: string;
  slot: SlotItem;
};

function getDatePlusDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function extractFields(responseBody: any): FieldItem[] {
  const data = responseBody?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.fields)) return data.fields;

  return [];
}

function isAvailableSlot(slot: SlotItem) {
  return (
    slot.available === true ||
    String(slot.status ?? "").toUpperCase() === "AVAILABLE"
  );
}

async function findAvailableBookingCandidate(
  apiUrl: string,
  fields: FieldItem[],
): Promise<BookingCandidate> {
  for (const field of fields) {
    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const date = getDatePlusDays(dayOffset);

      const params = new URLSearchParams({
        field_id: String(field.id),
        date,
        duration_minutes: "60",
      });

      const response = await fetch(
        `${apiUrl}/bookings/availability-slots?${params.toString()}`,
      );

      if (!response.ok) {
        continue;
      }

      const body = await response.json();
      const slots: SlotItem[] = body?.data?.slots ?? [];

      const availableSlot = slots.find(isAvailableSlot);

      if (availableSlot) {
        return {
          fieldId: field.id,
          date,
          slot: availableSlot,
        };
      }
    }
  }

  throw new Error("Không tìm thấy sân nào có khung giờ trống để test booking.");
}

describe("E2E - User đặt sân", () => {
  beforeEach(() => {
    cy.login("test4@example.com", "123456");
  });

  it("User tạo booking thành công với hình thức thanh toán tại sân", () => {
    cy.env(["apiUrl"]).then(({ apiUrl }) => {
      cy.request(`${apiUrl}/fields`)
        .then((fieldsRes) => {
          const fields = extractFields(fieldsRes.body);

          expect(fields.length).to.be.greaterThan(0);

          return findAvailableBookingCandidate(apiUrl, fields);
        })
        .then((candidate) => {
          cy.intercept("GET", "**/api/v1/bookings/availability-slots*").as(
            "getAvailabilitySlots",
          );

          cy.visit(`/booking/${candidate.fieldId}`);

          cy.get('[data-cy="booking-date-input"]').clear().type(candidate.date);

          cy.wait("@getAvailabilitySlots");

          cy.contains(
            '[data-cy="booking-slot-available"]',
            candidate.slot.start_time,
            { timeout: 10000 },
          ).click();

          cy.get('[data-cy="booking-step1-next"]').click();

          cy.get('[data-cy="booking-full-name"]').type("Nguyen Van A");
          cy.get('[data-cy="booking-email"]').type("test4@example.com");
          cy.get('[data-cy="booking-phone"]').type("0901234567");
          cy.get('[data-cy="booking-notes"]').type("Test đặt sân bằng Cypress");

          cy.get('[data-cy="booking-step2-next"]').click();

          cy.get('[data-cy="payment-method-onsite"]').click();

          cy.get('[data-cy="booking-submit"]').click();

          cy.get('[data-cy="booking-success-card"]', {
            timeout: 15000,
          }).should("be.visible");

          cy.get('[data-cy="booking-success-title"]').should(
            "contain",
            "Đặt sân thành công",
          );
        });
    });
  });
});