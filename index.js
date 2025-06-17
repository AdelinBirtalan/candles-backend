const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // ✅ important: to parse JSON request bodies

// Path to the JSON file
const productsPath = path.join(__dirname, "products.json");

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
      console.error("Error reading products.json:", err);
      return res.status(500).json({ error: "Failed to load products" });
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
        console.error("Error writing products.json:", err);
        return res.status(500).json({ error: "Failed to save product" });
      }

      res.status(201).json(newProduct);
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
