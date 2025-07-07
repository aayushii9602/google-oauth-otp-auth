import express from "express";
import userRoute from "../server/src/route/userRoute.js";
import connectDB from "../server/src/db/dbConfig.js";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

// regular middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

connectDB();

// router middleware
app.use("/api/v1/", userRoute);

export default app;
