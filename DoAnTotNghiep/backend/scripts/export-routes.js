import fs from "node:fs";
import path from "node:path";
import listEndpoints from "express-list-endpoints";
import app from "../src/app.js";

const OUTPUT_DIR = path.resolve(process.cwd(), "docs");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function getModuleName(apiPath) {
  if (apiPath.startsWith("/health")) return "Health";
  if (apiPath.includes("/auth")) return "Auth";
  if (apiPath.includes("/users")) return "Users";
  if (apiPath.includes("/uploads")) return "Uploads";
  if (apiPath.includes("/fields")) return "Public Fields";
  if (apiPath.includes("/bookings") && apiPath.includes("/owner")) return "Owner Bookings";
  if (apiPath.includes("/bookings")) return "Member Bookings";
  if (apiPath.includes("/payments")) return "Payments";
  if (apiPath.includes("/reviews") && apiPath.includes("/owner")) return "Owner Reviews";
  if (apiPath.includes("/reviews")) return "Reviews";
  if (apiPath.includes("/vouchers") && apiPath.includes("/owner")) return "Owner Vouchers";
  if (apiPath.includes("/vouchers")) return "Vouchers";
  if (apiPath.includes("/notifications")) return "Notifications";
  if (apiPath.includes("/owner")) return "Owners";
  if (apiPath.includes("/admin/field-reports")) return "Admin Field Reports";
  if (apiPath.includes("/field-reports")) return "Field Reports";
  if (apiPath.includes("/admin/review-reports")) return "Admin Review Reports";
  if (apiPath.includes("/review-reports")) return "Review Reports";
  if (apiPath.includes("/admin/reports")) return "Admin Reports";
  if (apiPath.includes("/owner/reports")) return "Owner Reports";
  if (apiPath.includes("/admin")) return "Admin";

  return "Other";
}

const endpoints = listEndpoints(app)
  .flatMap((endpoint) =>
    endpoint.methods.map((method) => ({
      method,
      path: endpoint.path,
      module: getModuleName(endpoint.path),
      middlewares: endpoint.middlewares?.join(", ") || "",
    }))
  )
  .filter((item) => {
    // Bỏ qua các route không cần đưa vào báo cáo nếu có
    return !item.path.startsWith("/__routes");
  })
  .sort((a, b) => {
    if (a.module !== b.module) return a.module.localeCompare(b.module);
    if (a.path !== b.path) return a.path.localeCompare(b.path);
    return a.method.localeCompare(b.method);
  });

const jsonPath = path.join(OUTPUT_DIR, "api-routes.json");
fs.writeFileSync(jsonPath, JSON.stringify(endpoints, null, 2), "utf8");

const csvHeader = ["Module", "Method", "Endpoint", "Middlewares"].join(",");
const csvRows = endpoints.map((item) =>
  [
    escapeCsv(item.module),
    escapeCsv(item.method),
    escapeCsv(item.path),
    escapeCsv(item.middlewares),
  ].join(",")
);
const csvPath = path.join(OUTPUT_DIR, "api-routes.csv");
fs.writeFileSync(csvPath, [csvHeader, ...csvRows].join("\n"), "utf8");

const moduleSummary = endpoints.reduce((acc, item) => {
  acc[item.module] = (acc[item.module] || 0) + 1;
  return acc;
}, {});

const mdLines = [];

mdLines.push("# Danh sách API routes");
mdLines.push("");
mdLines.push(`Tổng số endpoint: **${endpoints.length}**`);
mdLines.push("");

mdLines.push("## Tổng hợp theo module");
mdLines.push("");
mdLines.push("| STT | Module | Số API |");
mdLines.push("|---:|---|---:|");

Object.entries(moduleSummary).forEach(([module, count], index) => {
  mdLines.push(`| ${index + 1} | ${module} | ${count} |`);
});

mdLines.push("");
mdLines.push("## Danh sách API chi tiết");
mdLines.push("");
mdLines.push("| STT | Module | Method | Endpoint |");
mdLines.push("|---:|---|---|---|");

endpoints.forEach((item, index) => {
  mdLines.push(
    `| ${index + 1} | ${item.module} | ${item.method} | \`${item.path}\` |`
  );
});

const mdPath = path.join(OUTPUT_DIR, "api-routes.md");
fs.writeFileSync(mdPath, mdLines.join("\n"), "utf8");

console.log("Đã xuất danh sách API:");
console.log(`- ${jsonPath}`);
console.log(`- ${csvPath}`);
console.log(`- ${mdPath}`);
console.log(`Tổng số endpoint: ${endpoints.length}`);