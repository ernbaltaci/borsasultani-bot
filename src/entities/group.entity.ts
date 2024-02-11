import { Schema, model } from "mongoose";

export interface IGroups {
  groupId: String;
}

const groupSchema = new Schema<IGroups>(
  {
    groupId: { type: String, required: true },
  },
  { timestamps: true }
);

const groupModel = model<IGroups>("group", groupSchema);

const findOrCreateGroup = async (groupId: number) => {
  const getGroup = await groupModel.findOne({ groupId });

  if (getGroup) return getGroup;

  const group = await groupModel.create({
    groupId,
  });

  return group;
};

export { groupModel, findOrCreateGroup };
