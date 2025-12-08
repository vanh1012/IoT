  import jwt from "jsonwebtoken";
  import User from "../models/User.js";

  const JWT_SECRET = process.env.JWT_SECRET;

  export const authMiddleware = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token provided"
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token"
        });
      }

      req.userId = decoded.userId;
      next();

    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired. Please login again"
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
