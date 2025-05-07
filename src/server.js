import http from "http";
import api from "./api/api.js";
import initWebSocket from "./socket/socket.js";

const port = process.env.EXPRESS_PORT;
const server = http.createServer(api);

initWebSocket(server);

server.listen(port, () => console.log(`Server Running on port ${port}...`));