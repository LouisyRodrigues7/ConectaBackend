// src/app.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";   // <-- ADICIONADO
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// ----------------- CORS -----------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://conectabuspe.netlify.app",
  "https://conectabuspe.netlify.app/"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Vary", "Origin");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "null");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));

// ----------------- MIDDLEWARES -----------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ----------------- SANITY CHECK -----------------
app.get("/", (req, res) => res.status(200).json({ message: "🚀 API ConectaBus está online!" }));

// ----------------- ROTAS PRINCIPAIS -----------------
app.use("/api/users", userRoutes);
app.use("/api/relatorios", reportRoutes);   // <-- ADICIONADO

// ----------------- ERRO CENTRALIZADO -----------------
app.use(errorHandler);

export default app;
