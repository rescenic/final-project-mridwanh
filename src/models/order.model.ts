// src/models/order.model.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem extends Document {
  name: string;
  productId: mongoose.Types.ObjectId;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  grandTotal: number;
  orderItems: IOrderItem[];
  createdBy: mongoose.Types.ObjectId;
  status: "pending" | "completed" | "cancelled";
}

const OrderItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  productId: { type: mongoose.Types.ObjectId, required: true, ref: "Product" },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1, max: 5 },
});

const OrderSchema: Schema = new Schema(
  {
    grandTotal: { type: Number, required: true },
    orderItems: { type: [OrderItemSchema], required: true },
    createdBy: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;
