import express from "express";
import helmet from "helmet";
import corsOptions from "./config/corsOptions.js";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { formSubmitEmail } from "./utils/emailTemplates/formSubmitEmail.js";
import { validationResult } from "express-validator";
import { fileURLToPath } from "url";
import {
  errorHandler,
  loginLimiter,
  formValidator,
} from "./middleware/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isJsonRequest(req) {
  return req.accepts("json") && req.headers.accept.includes("application/json");
}

function startServer() {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  app.post("/:email", formValidator, loginLimiter, async (req, res, next) => {
    const origin = req.headers.origin || req.headers.referer;
    const { email } = req.params;
    const { name, email: userEmail, message, _next } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (isJsonRequest(req)) {
        return next(
          errorHandler(
            400,
            "Invalid fields, please check your form and try again!"
          )
        );
      }
      return res.render("error", {
        origin,
        error: "Invalid fields, please check your form and try again!",
      });
    }

    if (!email) {
      if (isJsonRequest(req)) {
        return next(
          errorHandler(
            400,
            "Destination email required! Please add your destination to the request as 'https:/yoursite/youremail@example.com'"
          )
        );
      }
      return res.render("error", {
        origin,
        error:
          "Destination email required! Please add your destination to the request as 'https:/yoursite/youremail@example.com'",
      });
    }

    if (isJsonRequest(req)) {
      try {
        await formSubmitEmail(email, name, userEmail, message, origin);

        return res.json({
          message:
            "Thank you for getting in touch!, We will get back in touch with you soon!Have a great day!",
        });
      } catch (error) {
        return next(
          errorHandler(
            500,
            "We're sorry but something went wrong, please try again later, thanks."
          )
        );
      }
    }

    try {
      await formSubmitEmail(email, name, userEmail, message, origin);

      if (_next) {
        return res.redirect(_next);
      }
      return res.render("success", {
        origin,
        message:
          "Thank you for getting in touch!, We will get back in touch with you soon!Have a great day!",
      });
    } catch (error) {
      return res.render("error", {
        origin,
        error:
          "We're sorry but something went wrong, please try again later, thanks.",
      });
    }
  });

  app.all("*", (req, res) => {
    res.status(404);
    if (req.accepts("json")) {
      res.json({ message: "404 Not Found" });
    } else {
      res.type("txt").send("404 Not Found");
    }
  });

  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    if (isJsonRequest(req)) {
      return res
        .status(statusCode)
        .json({ success: false, statusCode, message, isError: true });
    }

    res.status(statusCode).render("error", {
      origin: req.headers.origin,
      error: message,
    });
  });

  app.listen(PORT, () => {
    const baseURL =
      process.env.NODE_ENV === "production"
        ? `${process.env.HOST}`
        : `http://localhost:${PORT}`;

    console.log(`Listening on ${baseURL}`);
  });
}

startServer();
