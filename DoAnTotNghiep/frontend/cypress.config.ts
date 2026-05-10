import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,

  env: {
    apiUrl: "http://localhost:8080/api/v1",
  },

  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1440,
    viewportHeight: 900,

    setupNodeEvents(on, config) {
      return config;
    },
  },
});