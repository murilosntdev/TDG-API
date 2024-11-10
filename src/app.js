import compression from "compression";
import cors from "cors";
import express from "express";
import * as dotenv from "dotenv";
import accountRouter from "./routes/account.routes.js";

dotenv.config();

const port = process.env.EXPRESS_PORT;
const app = express();

app.use(compression());
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET"],
    credentials: true
}));

app.get("/", (req, res) => {
    res.status(200);
    res.json({
        status: 200,
        message: "Bem-vindo à API Truco da Galera",
        details: {
            operating_status: "online",
            version: process.env.SYSTEM_API_VERSION,
            links: {
                documentation: "https://github.com/murilosntdev/TDG-API"
            }
        }
    });
});

app.use("/account", accountRouter);

app.use((req, res) => {
    res.status(404);
    res.json({
        error: {
            status: 404,
            message: "Rota Não Encontrada"
        }
    });
});

app.listen(port, () => console.log(`Server Running on port ${process.env.EXPRESS_PORT}...`));