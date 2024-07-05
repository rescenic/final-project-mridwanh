// src/utils/interfaces.ts

import { Request } from "express";
import { Document } from "mongoose";

export interface IReqUser extends Request {
  user: {
    role: string;
    id: string;
  };
}

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: string;
  profilePicture: string;
}