var express = require("express");
var router = express.Router();
var productController = require("../controllers/productController");

router.get("/", async (req, res, next) => {
  try {
    let products = await productController.getProducts();
    res.status(200).send({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let product = await productController.getProductById(id);
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let product = await productController.createProduct(req.body);
    res.status(201).send({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let product = await productController.updateProduct(id, req.body);
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let product = await productController.deleteProduct(id);
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
