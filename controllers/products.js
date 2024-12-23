import Product from "../models/Product.js";
import Category from "../models/Category.js";
// CRUD for Products

//CREATE
export const create = async (req, res) => {
  try {
    const { name, price, category, description, images, stock } = req.body;

    // Validate if the category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ error: "Invalid category ID." });
    }

    // Create a new product
    const product = new Product({
      name,
      price,
      category,
      description,
      images,
      stock,
    });

    // Save product to the database
    await product.save();

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


//READ
//with filters
export const read = (req, res) => {
  const { name, category, minPrice, maxPrice } = req.query;

  const filters = {};
  if (name) filters.name = { $regex: name, $options: "i" }; // חיפוש חלקי, לא רגיש לאותיות גדולות/קטנות
  if (category) filters.category = category;
  if (minPrice) filters.price = { ...filters.price, $gte: parseFloat(minPrice) };
  if (maxPrice) filters.price = { ...filters.price, $lte: parseFloat(maxPrice) };

  Product.find(filters)
    .populate("category")
    .then((products) => res.status(200).json(products))
    .catch((err) => res.status(500).json({ error: err.message }));
};


//UPDATE
export const update = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
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
