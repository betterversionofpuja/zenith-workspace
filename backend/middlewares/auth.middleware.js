import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";


export const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const token =
      req.cookies?.token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized User",
      });
    }
/*🔐Redis is used here for Blacklisting JWT tokens after logout.

"The time user logout, 
we store their token in redis with expiration time, 
This prevents logged-out users from reusing the same token until it expires."

*/

    const isBlackListed = await redisClient.get(token);

    if (isBlackListed) {
      res.cookie("token", "");
      return res.status(401).json({
        error: "Unauthorized User",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      error: "Unauthorized User",
    });
  }
};