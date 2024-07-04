// src/models/user.models.ts

import mongoose from "mongoose";
import { encrypt } from "@/utils/encryption";
import { SECRET } from "@/utils/env";
import mail from "@/utils/mail";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
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

UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = encrypt(SECRET, user.password);
  }
  next();
});

UserSchema.post("save", async function (doc, next) {
  const user = doc;

  try {
    const content = await mail.render("register-success.ejs", {
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
  const update = this.getUpdate() as mongoose.UpdateQuery<any>;
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

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
