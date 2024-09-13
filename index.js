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

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isJsonRequest(req) {
  return req.accepts("json") && req.headers.accept.includes("application/json");
}


async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify`,
    null,
    {
      params: {
        secret: secretKey,
        response: token,
      },
    }
  );
  return response.data.success;
}


function startServer() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: corsOptions }));
  app.use(express.urlencoded({ extended: true }));

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  app.post("/", formValidator, loginLimiter, async (req, res, next) => {
    const origin = req.headers.origin || req.headers.referer;
    const { name, email, message, _next } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (isJsonRequest(req)) {
        return next(errorHandler(400, "Invalid fields, please try again!"));
      }
      return res.render("error", { origin });
    }

    if (isJsonRequest(req)) {
      try {
        await formSubmitEmail("contact@fleamarketyo.it", name, email, message);

        return res.json({ message: "Form submitted successfully!" });
      } catch (error) {
        return next(
          errorHandler(500, "Error submitting form, please try again!")
        );
      }
    }

    try {
      await formSubmitEmail("contact@fleamarketyo.it", name, email, message);

      if (_next) {
        return res.redirect(_next);
      }
      return res.render("success", { origin });
    } catch (error) {
      return res.render("error", { origin });
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
    res
      .status(statusCode)
      .json({ success: false, statusCode, message, isError: true });
  });

  app.listen(PORT, () => {
    const baseURL =
      process.env.NODE_ENV === "production"
        ? ``
        : `http://localhost:${PORT}`;

    console.log(`Listening on ${baseURL}`);
  });
}

startServer();
