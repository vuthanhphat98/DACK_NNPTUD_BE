let category = require("../schemas/category");

module.exports = {
  getCategories: async function () {
    return await category.find();
  },
  getCategoryById: async function (id) {
    return await category.findById(id);
  },
  createCategory: async function (name) {
    let newCategory = new category({ name: name });
    return await newCategory.save();
  },
  updateCategory: async function (id, name) {
    return await category.findByIdAndUpdate(id, { name: name });
  },
  deleteCategory: async function (id) {
    return await category.findByIdAndDelete(id);
  },
};
