// import express from "express";
// import cors from "cors";
// import path from "path";

// // Routes
// import authRoutes from "./modules/auth/auth.routes.js";

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Serve static files
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// // Register routes
// app.use("/auth", authRoutes);

// export default app;
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import ownerFieldRoutes from "./modules/owner/owner.field.routes.js";
import ownerProfileRoutes from "./modules/owner/owner.profile.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// static serve uploads
app.use("/uploads", express.static("uploads"));

app.use("/auth", authRoutes);
app.use("/admin",adminRoutes);
app.use("/owner/fields", ownerFieldRoutes);
app.use("/owner/profile", ownerProfileRoutes);




export default app;
