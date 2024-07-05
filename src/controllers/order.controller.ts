// src/controllers/order.controller.ts

import { Request, Response } from "express";
import * as Yup from "yup";
import OrderModel from "@/models/order.model";
import ProductModel from "@/models/products.model";
import UserModel from "@/models/user.model";
import { IReqUser } from "@/utils/interfaces";
import mail from "@/utils/mail";
import path from "path";

const createOrderSchema = Yup.object().shape({
  orderItems: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required(),
        productId: Yup.string().required(),
        price: Yup.number().required(),
        quantity: Yup.number().required().min(1).max(5),
      })
    )
    .required(),
});

export default {
  async create(req: Request, res: Response) {
    const userId = (req as IReqUser).user.id;

    try {
      await createOrderSchema.validate(req.body);

      const { orderItems } = req.body;

      // Validate product quantities and fetch prices
      let grandTotal = 0;
      const validatedOrderItems = await Promise.all(
        orderItems.map(async (item: any) => {
          const product = await ProductModel.findById(item.productId);
          if (!product || product.qty < item.quantity) {
            throw new Error(`Insufficient quantity for product ${item.name}`);
          }
          item.price = product.price;
          grandTotal += item.price * item.quantity;
          return item;
        })
      );

      // Create the order
      const orderData = {
        orderItems: validatedOrderItems,
        createdBy: userId,
        status: "pending",
        grandTotal: grandTotal,
      };

      const newOrder = await OrderModel.create(orderData);

      // Deduct product quantities
      await Promise.all(
        orderItems.map(async (item: any) => {
          await ProductModel.findByIdAndUpdate(item.productId, {
            $inc: { qty: -item.quantity },
          });
        })
      );

      // Send invoice email
      const customer = await UserModel.findById(userId);
      if (!customer) {
        return res.status(404).json({
          message: "User not found",
          data: null,
        });
      }

      const invoiceTemplatePath = path.join(
        __dirname,
        "../utils/mail/templates/invoice.ejs"
      );
      const emailContent = await mail.render(invoiceTemplatePath, {
        customerName: customer.fullName,
        orderItems: validatedOrderItems,
        grandTotal,
        contactEmail: "rescenic@zohomail.com",
        companyName: "Rescenic Store",
        year: new Date().getFullYear(),
      });

      await mail.send({
        to: customer.email,
        subject: "Order Invoice",
        content: emailContent,
      });

      res.status(201).json({
        message: "Order created successfully",
        data: newOrder,
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return res.status(400).json({
          message: "Validation failed",
          error: error.errors,
        });
      }

      const _err = error as Error;
      res.status(500).json({
        message: "Error creating order",
        data: _err.message,
      });
    }
  },

  async findUserOrders(req: Request, res: Response) {
    const userId = (req as IReqUser).user.id;
    const { limit = 10, page = 1 } = req.query;

    try {
      const orders = await OrderModel.find({ createdBy: userId })
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 });

      const totalOrders = await OrderModel.countDocuments({
        createdBy: userId,
      });

      res.status(200).json({
        message: "User orders retrieved successfully",
        data: orders,
        page: +page,
        limit: +limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / +limit),
      });
    } catch (error) {
      const _err = error as Error;
      res.status(500).json({
        message: "Error retrieving user orders",
        data: _err.message,
      });
    }
  },
};
