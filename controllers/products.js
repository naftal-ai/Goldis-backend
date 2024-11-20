import Product from "../models/Product.js";
import Category from "../models/Category.js";
// CRUD for Products

//CREATE
export const create = async (req, res) => {
  res.json({ message: "empty function" });
};
//READ
export const read = {
  //all
  all: async (req, res) => {
    try {
      const products = await Product.find();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  //by category
  byCategory: async (req, res) => {
    const categoryName = req.params.category;
    try {
      const category = await Category.findOne({ name: categoryName });
      if (category) {
        const products = await Product.find({ category: category._id });
        res.status(200).json({ products });
      } else {
        return res.status(400).json({ message: "Category not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  //by price

  //by name

  //by id
  byId: async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.json(product);
  },
};

//UPDATE

export const update = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(product);
};

//DELETE

export const delete_p = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.status(204).send();
};
