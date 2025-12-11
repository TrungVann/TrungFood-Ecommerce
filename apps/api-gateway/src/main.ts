import express, { urlencoded } from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import axios from "axios";
import cookieParser from "cookie-parser";
import initializeSiteConfig from "./libs/initializeSiteConfig";

const app = express();

/**
 * CORS middleware
 * Chỉ cho phép các request đến từ domain frontend được cấu hình
 * credentials: true -> cho phép gửi cookie, Authorization header.
 */
app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

// Logger hiển thị thông tin request (method, url, status,...)
app.use(morgan("dev"));

// Cho phép parse JSON và form-data với dung lượng tối đa 100MB
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Dùng cookie parser để đọc cookie từ request
app.use(cookieParser());

// Đặt trust proxy để Express lấy đúng IP khi chạy sau reverse proxy (Nginx, Cloudflare)
app.set("trust proxy", 1);

/**
 * Rate limiting chống DDOS / spam request
 * - 1 window = 15p
 * - User đã login (req.user) có limit cao hơn: 1000 req / 15 phút
 * - User chưa login chỉ được: 100 req / 15 phút
 *
 * keyGenerator: ưu tiên dùng apiKey nếu có -> cho phép giới hạn theo API key thay vì IP
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: "Too many requests, please try again later!" },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => {
    // Nếu có apiKey thì dùng làm key cho rate limit
    if (req.query.apiKey) {
      return req.query.apiKey;
    }

    // Ngược lại thì sử dụng IP
    return ipKeyGenerator(req.ip);
  },
});

// Áp dụng rate limit cho toàn bộ API Gateway
app.use(limiter);

/**
 * Endpoint kiểm tra gateway health-check
 * Dùng bởi DevOps, Load balancer, UptimeRobot... để kiểm tra gateway còn hoạt động không
 * Không bị proxy sang các service khác.
 */
app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" }); //trả về JSON để check gateway còn hoạt động không
});

/**
 * Microservices routing
 *
 * /product -> chuyển tiếp sang Product service (port 6002) -> tất cả route còn lại chuyển sang Main Service (port 6001)
 *
 * express-http-proxy giúp giữ nguyên body, header, method,...
 */
app.use("/product", proxy("http://localhost:6002"));
app.use("/", proxy("http://localhost:6001")); //tất cả request đến API gateway sẽ được chuyển tiếp sang service chạy ở cổng 6001

/**
 * Khởi chạy server
 * Đồng thời chạy hàm khởi tạo config hệ thống (site config)
 */
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);

  try {
    initializeSiteConfig(); //Load config lần đầu khi server chạy
    console.log("Site config initialized successfully!");
  } catch (error) {
    console.log("Failed to initialize site config: ", error);
  }
});

// Lắng nghe lỗi không mong muốn từ server
server.on("error", console.error);
