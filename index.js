const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const port = 5000;
const productsFile = path.join(__dirname, "products.json");

// Middleware
app.use(cors());
app.use(express.json());

// Helper to read products
const readProducts = async () => {
  const data = await fs.readFile(productsFile, "utf8");
  return JSON.parse(data);
};

// Helper to write products
const writeProducts = async (products) => {
  await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
};

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await readProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get single product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const products = await readProducts();
    const product = products.find((p) => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add new product
app.post("/api/products", async (req, res) => {
  try {
    const products = await readProducts();
    const newProduct = {
      id: products.length ? products[products.length - 1].id + 1 : 1,
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
      image: req.body.image,
      stock: req.body.stock,
    };
    products.push(newProduct);
    await writeProducts(products);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update product
app.put("/api/products/:id", async (req, res) => {
  try {
    const products = await readProducts();
    const index = products.findIndex((p) => p.id === parseInt(req.params.id));
    if (index === -1)
      return res.status(404).json({ error: "Product not found" });
    products[index] = {
      ...products[index],
      ...req.body,
      id: parseInt(req.params.id),
    };
    await writeProducts(products);
    res.json(products[index]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const products = await readProducts();
    const filteredProducts = products.filter(
      (p) => p.id !== parseInt(req.params.id)
    );
    if (products.length === filteredProducts.length) {
      return res.status(404).json({ error: "Product not found" });
    }
    await writeProducts(filteredProducts);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
