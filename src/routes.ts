// src/routes.ts

import express from "express";
import authController from "./controllers/auth.controller";
import authMiddleware from "./middlewares/auth.middleware";
import aclMiddleware from "./middlewares/acl.middleware";
import uploadMiddleware from "./middlewares/upload.middleware";
import uploadController from "./controllers/upload.controller";
import productsController from "./controllers/products.controller";
import categoryController from "./controllers/category.controller";
import orderController from "./controllers/order.controller";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Sanbercode REST API Server",
    data: "Created by: Muhammad Ridwan Hakim",
  });
});

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get(
  "/auth/me",
  authMiddleware,
  aclMiddleware(["admin"]),
  authController.me
);

router.get("/products", productsController.findAll);
router.post("/products", productsController.create);
router.get("/products/:id", productsController.findOne);
router.put("/products/:id", productsController.update);
router.delete("/products/:id", productsController.delete);

router.post("/upload", uploadMiddleware.single, uploadController.single);
router.post("/uploads", uploadMiddleware.multiple, uploadController.multiple);

router.get("/categories", categoryController.findAll);
router.post("/categories", categoryController.create);
router.get("/categories/:id", categoryController.findOne);
router.put("/categories/:id", categoryController.update);
router.delete("/categories/:id", categoryController.delete);

router.post("/orders", authMiddleware, orderController.create);
router.get("/orders", authMiddleware, orderController.findUserOrders);

export default router;
