import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Sport Field Management System API",
    version: "1.0.0",
    description:
      "API documentation for Sport Field Management System backend.",
  },
  servers: [
    {
      url: "http://localhost:8080",
      description: "Local server",
    },
  ],
  tags: [
    { name: "Health", description: "Kiểm tra trạng thái hệ thống" },
    { name: "Auth", description: "Xác thực người dùng" },
    { name: "Users", description: "Quản lý thông tin người dùng" },
    { name: "Fields", description: "Sân thể thao công khai" },
    { name: "Bookings", description: "Đặt sân của người dùng" },
    { name: "Payments", description: "Thanh toán" },
    { name: "Owner", description: "Chức năng dành cho chủ sân" },
    { name: "Admin", description: "Chức năng dành cho quản trị viên" },
    { name: "Reviews", description: "Đánh giá sân" },
    { name: "Reports", description: "Báo cáo vi phạm" },
    { name: "Notifications", description: "Thông báo" },
    { name: "Uploads", description: "Upload file" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Thành công" },
          data: { type: "object" },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Dữ liệu không hợp lệ" },
          code: { type: "string", example: "VALIDATION_ERROR" },
          errors: { nullable: true },
          requestId: {
            type: "string",
            example: "80a837cb-0597-402e-85de-b351b4b8580b",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "user@gmail.com" },
          password: { type: "string", example: "123456" },
        },
      },
      CreateBookingRequest: {
        type: "object",
        required: [
          "field_id",
          "start_datetime",
          "end_datetime",
          "requested_payment_method",
        ],
        properties: {
          field_id: { type: "integer", example: 9 },
          start_datetime: {
            type: "string",
            example: "2026-05-10T14:00:00",
          },
          end_datetime: {
            type: "string",
            example: "2026-05-10T15:00:00",
          },
          requested_payment_method: {
            type: "string",
            example: "BANK_TRANSFER",
          },
          contact_name: { type: "string", example: "Nguyễn Văn A" },
          contact_email: { type: "string", example: "user@gmail.com" },
          contact_phone: { type: "string", example: "0900000000" },
          notes: { type: "string", example: "Testing" },
        },
      },
      CreatePaymentRequest: {
        type: "object",
        required: ["booking_id", "provider"],
        properties: {
          booking_id: { type: "integer", example: 1 },
          provider: { type: "string", example: "BANK_TRANSFER" },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [
    "./src/app.js",
    "./src/routes/*.js",
    "./src/modules/**/*.routes.js",
  ],
};

export const swaggerSpec = swaggerJSDoc(options);