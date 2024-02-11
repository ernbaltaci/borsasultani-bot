import { Schema, model } from "mongoose";

export interface IUsers {
  userId: String;
}

const userSchema = new Schema<IUsers>(
  {
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

const userModel = model<IUsers>("user", userSchema);

const findOrCreateUser = async (userId: number) => {
  const getUser = await userModel.findOne({ userId });

  if (getUser) return getUser;

  const user = await userModel.create({
    userId,
  });

  return user;
};

export { userModel, findOrCreateUser };
