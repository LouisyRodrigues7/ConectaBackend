// src/app.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// ----------------- CORS -----------------
//  allowedOrigins conforme tuas URLs de front
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://conectabuspe.netlify.app",
  "https://conectabuspe.netlify.app/"
];

// Middleware CORS robusto (responde preflight corretamente)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Vary", "Origin");
  } else {
    // bloqueia: nenhuma header de CORS é enviada
    // opcional: podes enviar um header explicando, mas é melhor só retornar 403 em endpoints específicos
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
    return callback(null, false); // bloqueia sem lançar exception
  },
  credentials: true
}));

// ----------------- MIDDLEWARES -----------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// rota de sanity check
app.get("/", (req, res) => res.status(200).json({ message: "🚀 API ConectaBus está online!" }));

// mount das rotas
app.use("/api/users", userRoutes);

// tratamento de erro centralizado (deve vir por último)
app.use(errorHandler);

export default app;
