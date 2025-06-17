const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

const productsPath = path.join(__dirname, "products.json");

// Middleware
app.use(cors());
app.use(express.json());

// GET all products
app.get("/api/products", (req, res) => {
  fs.readFile(productsPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading products.json:", err);
      return res.status(500).json({ error: "Failed to load products" });
    }

    const products = JSON.parse(data);
    res.json(products);
  });
});

// POST a new product
app.post("/api/products", (req, res) => {
  const { title, price, description, image, stock } = req.body;

  if (!title || !price || !description || !image || stock == null) {
    return res.status(400).json({ error: "Missing required product fields." });
  }

  fs.readFile(productsPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read products" });
    }

    const products = JSON.parse(data);
    const newProduct = {
      id: Date.now().toString(),
      title,
      price,
      description,
      image,
      stock,
    };

    products.push(newProduct);

    fs.writeFile(productsPath, JSON.stringify(products, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save product" });
      }

      res.status(201).json(newProduct);
    });
  });
});

// PUT (update) a product
app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const updatedProduct = req.body;

  fs.readFile(productsPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read products" });
    }

    let products = JSON.parse(data);
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    products[index] = { ...products[index], ...updatedProduct };

    fs.writeFile(productsPath, JSON.stringify(products, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to update product" });
      }

      res.json(products[index]);
    });
  });
});

// DELETE a product
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;

  fs.readFile(productsPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read products" });
    }

    let products = JSON.parse(data);
    const newProducts = products.filter((p) => p.id !== id);

    if (newProducts.length === products.length) {
      return res.status(404).json({ error: "Product not found" });
    }

    fs.writeFile(productsPath, JSON.stringify(newProducts, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to delete product" });
      }

      res.json({ message: "Product deleted" });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
