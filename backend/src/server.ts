import mongoose from "mongoose";
import createApp from "./app";
import dotenv from "dotenv";
dotenv.config();

console.log("🔍 Loaded MONGO_URI =", process.env.MONGO_URI);

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log(" Mongo connected at", process.env.MONGO_URI);

    const app = createApp();
    const PORT = Number(process.env.PORT) || 4000;
    app.listen(PORT, () => {
      console.log(` API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(" Mongo connection error:", err);
  }
}

main();
