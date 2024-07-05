// src/models/user.models.ts

import mongoose, { Schema } from "mongoose";
import { encrypt } from "@/utils/encryption";
import { SECRET } from "@/utils/env";
import mail from "@/utils/mail";
import path from "path";
import { IUser } from "@/utils/interfaces";

const UserSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    profilePicture: {
      type: String,
      default: "default.jpg",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre<IUser>("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = encrypt(SECRET, user.password);
  }
  next();
});

UserSchema.post<IUser>("save", async function (doc, next) {
  const user = doc;

  try {
    const templatePath = path.join(
      __dirname,
      "../utils/mail/templates/register-success.ejs"
    );
    const content = await mail.render(templatePath, {
      username: user.username,
    });

    await mail.send({
      to: user.email,
      subject: "Registration Success",
      content,
    });
  } catch (error) {
    console.error("Error sending registration email: ", error);
  }

  next();
});

UserSchema.pre("updateOne", async function (next) {
  const update = this.getUpdate() as any;
  if (update && update.password) {
    update.password = encrypt(SECRET, update.password);
  }
  next();
});

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
