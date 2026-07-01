import jwt from "jsonwebtoken";

export function getUserFromToken(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_for_dev'
    );

    return decoded;
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return null;
  }
}