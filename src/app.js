import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://conectabuspe.netlify.app", 
  "https://conectabuspe.netlify.app/" 
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requests sem "origin" (como Postman, ou mobile app)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("🚫 CORS bloqueou origem:", origin);
        callback(new Error("Não permitido pelo CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Middleware padrão
app.use(bodyParser.json());
app.use("/api/users", userRoutes);
app.use(errorHandler);

export default app;
