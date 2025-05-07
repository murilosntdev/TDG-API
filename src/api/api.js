import * as dotenv from "dotenv";
import express from "express";
import compression from "compression";
import cors from "cors";
import router from "./routes/routes.js";

dotenv.config();

const api = express();

api.use(compression());
api.use(express.json());
api.use(cors({
    origin: JSON.parse(process.env.CORS_ORIGIN),
    methods: ["GET", "POST"],
    credentials: true
}));

api.get("/", (req, res) => {
    res.status(200).json({
        "status": "200",
        "message": "Bem-vindo à API Truco da Galera",
        "details": {
            "operating_status": "online",
            "version": process.env.SYSTEM_API_VERSION,
            "links": {
                "documentation": "https://github.com/murilosntdev/TDG-API"
            }
        }
    });
});

api.use(router);

api.use((req, res) => {
    res.status(404).json({
        "error": {
            "status": 404,
            "message": "Rota Não Encontrada"
        }
    });
});

export default api;