import mongoose from "mongoose";

const connectMongo = async () => {
  mongoose.set("strictQuery", false);

  try {
    await mongoose.connect(process.env.MONGODB_URL as string, {});
    console.log("Database connected");
  } catch (error) {
    console.log("Database Connection Error:", error);
    process.exit(1);
  }
};

export default connectMongo;
