// Augment express-session data to include userId
import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}
