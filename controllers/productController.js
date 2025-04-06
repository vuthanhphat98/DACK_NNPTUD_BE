let productSchema = require("../schemas/product");

module.exports = {
  getProducts: async function () {
    return await productSchema.find();
  },
  getProductById: async function (id) {
    return await productSchema.findById(id);
  },
  createProduct: async function (product) {
    let newProduct = new productSchema(product);
    return await newProduct.save();
  },
  updateProduct: async function (id, product) {
    return await productSchema.findByIdAndUpdate(id, product);
  },
  deleteProduct: async function (id) {
    return await productSchema.findByIdAndDelete(id);
  },
};
