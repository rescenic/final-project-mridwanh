// src/models/order.model.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  name: string;
  productId: mongoose.Types.ObjectId;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  orderItems: IOrderItem[];
  createdBy: mongoose.Types.ObjectId;
  status: string;
  grandTotal: number;
}

const OrderSchema: Schema = new Schema(
  {
    orderItems: [
      {
        name: { type: String, required: true },
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    grandTotal: { type: Number, required: true },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;
