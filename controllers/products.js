import Product from "../models/Product.js";
import Category from "../models/Category.js";
// CRUD for Products

//CREATE
export const create = async (req, res) => {
  res.json({ message: "empty function" });
};
//READ
//with filters
export const read = (req, res) => { 

  const { category, minPrice, maxPrice } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (minPrice) filters.price = { ...filters.price, $gte: parseFloat(minPrice) };
  if (maxPrice) filters.price = { ...filters.price, $lte: parseFloat(maxPrice) };

  Product.find(filters)
    .then(products => res.status(200).json(products))
    .catch(err => res.status(500).json({ error: err.message }));

  }
//UPDATE

export const update = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(product);
};

//DELETE

export const delete_p = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
    
  } catch (error) {
    res.status(500).json({error : error.message});
  }
};
