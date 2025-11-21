require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB setup
const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("PMS");
    const userCollection = db.collection("user");
    const assetCollection = db.collection("assets");

    // assets related route

    // get all assets
    app.get("/assets", async (req, res) => {
      const assets = await assetCollection.find().toArray();
      res.send(assets);
    });

    // get single assets
    app.get("/assets/:id", async (req, res) => {
      const id = req.params.id;
      const filter = await assetCollection.findOne({ _id: new ObjectId(id) });
      res.send(filter);
    });

    // post create new asset
    app.post("/assets", async (req, res) => {
      const asset = req.body;
      const result = await assetCollection.insertOne(asset);
      res.send(result);
    });
    // patch update assets

    app.patch("/assets/:id", async (req, res) => {
      const id = req.params.id;
      const update = req.body;
      const result = await assetCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: update }
      );
      res.send(result);
    });

    app.delete("/assets/:id", async (req, res) => {
      const id = req.params.id;
      const result = await assetCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // user POST route

    app.post("/users", async (req, res) => {
      const user = req.body;
      const exists = await userCollection.findOne({ email: user.email });

      if (exists) {
        return res.send({ message: "User already exists" });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email });
      res.send(user);
    });

    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const updated = req.body;

      const result = await userCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updated }
      );
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const result = await userCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

// Call connectDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Hello Express!");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
