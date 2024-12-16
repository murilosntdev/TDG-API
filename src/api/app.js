import compression from "compression";
import cors from "cors";
import express from "express";
import * as dotenv from "dotenv";
import http from "http";
import initWebSocket from "../socket/socket.js";
import accountRouter from "./routes/account.routes.js";
import sessionRouter from "./routes/session.routes.js";

dotenv.config();

const port = process.env.EXPRESS_PORT;
const app = express();

app.use(compression());
app.use(express.json());
app.use(cors({
    origin: JSON.parse(process.env.CORS_ORIGIN),
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
app.use("/session", sessionRouter);

app.use((req, res) => {
    res.status(404);
    res.json({
        error: {
            status: 404,
            message: "Rota Não Encontrada"
        }
    });
});

const server = http.createServer(app);

initWebSocket(server);

server.listen(port, () => console.log(`Server Running on port ${process.env.EXPRESS_PORT}...`));