var express = require("express");
var router = express.Router();
var categoryController = require("../controllers/categoryController");

router.get("/", async (req, res, next) => {
  try {
    let categories = await categoryController.getCategories();
    res.status(200).send({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let category = await categoryController.getCategoryById(id);
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let name = req.body.name;
    let category = await categoryController.createCategory(name);
    res.status(201).send({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let name = req.body.name;
    let category = await categoryController.updateCategory(id, name);
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let category = await categoryController.deleteCategory(id);
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
