/**
 * AUTH SERVICE API ENTRY POINT
 * File này khởi tạo server Express cho service Authentication
 * cấu hình middleware, CORS, SwaggerUI, routing và error handling
 */
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("./swagger-output.json");
import express from "express";
import cors from "cors";
import { errorMiddleware } from "@packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import router from "./routes/auth.router";

const app = express();

/**
 * CORS configuration:
 * - Cho phép frontend tại http://localhost:3000 gọi API
 * - Cho phép gửi cookie
 * - Cho phép header Authorization để gửi JWT
 */
app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

//Middleware để parse JSON body
app.use(express.json());

//Middleware để đọc cookies từ request
app.use(cookieParser());

/**
 * Route test server status
 * Dùng để kiểm tra service hoạt động hay chưa
 */
app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});

/**
 * Swagger API Docs:
 * - /api-docs -> giao diện UI
 * - /docs-json -> trả về file JSON gốc
 */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});

/**
 * Main API Router
 * - Tất cả các route authenication nằm trong trang /routes/auth.router.ts
 * - Mount tại prefix /api
 */
app.use("/api", router);

/**
 * Global error handler:
 * - Bắt mọi exception từ controller
 * - Trả JSON error theo chuẩn hệ thống
 */
app.use(errorMiddleware);

const port = process.env.PORT || 6001;

/**
 * Start server và lắng nghe port
 * Log ra đường dẫn API và Swagger để tiện debug
 */
const server = app.listen(port, () => {
  console.log(`Auth service is running at http://localhost:${port}/api`);
  console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
});

//Lắng nghe lỗi cấp server (VD: port đang bị chiếm)
server.on("error", (err) => {
  console.log("Server Error: ", err);
});
