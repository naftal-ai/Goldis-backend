import Category from "../models/Category.js";

export const create = async (req, res) => {
    const { name, image } = req.body;
    const category = new Category({
      name,
      image,
    });
    try {
      const response = await category.save();
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const readAll =  async (req, res) => {
    try {
      const categories = await Category.find();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const update = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
  
    try {
      const category = await Category.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    //TODO
    //check if there is products under this category
    try {
      const category = await Category.findOneAndDelete({ _id: id });
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };