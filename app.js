import express from "express";
import path from "node:path";
import indexRouter from "./routes/index.js";
import HttpError from "http-errors";
import authorization from "./middelwares/authorization.js";
import errorHandler from "./middelwares/errorHandler.js";
import cors from "./middelwares/cors.js";

const app = express();

app.use(cors);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve('public')));

app.use(authorization)
app.use(indexRouter)
app.use((req, res, next) => {
    next(HttpError(404))
})

app.use(errorHandler)

app.listen(4001, "127.0.0.1", () => {
    console.log('Server started...');
})


