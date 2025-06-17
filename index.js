const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const app = express();
const productsFile = "./products.json";

app.use(cors({ origin: "https://candleshome.netlify.app" }));
app.use(express.json());

app.get("/api/products", async (_, res) => {
  try {
    const products = JSON.parse(await fs.readFile(productsFile));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to read products" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const products = JSON.parse(await fs.readFile(productsFile));
    const newProduct = { id: products.length + 1, ...req.body };
    products.push(newProduct);
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
    res.json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const products = JSON.parse(await fs.readFile(productsFile));
    const id = parseInt(req.params.id);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1)
      return res.status(404).json({ error: "Product not found" });
    products[index] = { id, ...req.body };
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
    res.json({ success: true, product: products[index] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const products = JSON.parse(await fs.readFile(productsFile));
    const id = parseInt(req.params.id);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1)
      return res.status(404).json({ error: "Product not found" });
    products.splice(index, 1);
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

app.get("/api/products/download", (_, res) => {
  res.download(productsFile);
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
