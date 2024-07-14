const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lc40fqb.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const userCollection = client.db("DiverseBlog").collection("users");
        const blogsCollection = client.db("DiverseBlog").collection("blogs");

        app.post("/users", async (req, res) => {
            const body = req.body;
            const query = { email: body.email };
            const existingUSer = await userCollection.findOne(query);
            if (existingUSer) {
                return res.send({ message: "user already exists" });
            }
            const result = await userCollection.insertOne(body);
            res.send(result);
        });

        app.post("/blog", async (req, res) => {
            const newBlog = req.body;
            const result = await blogsCollection.insertOne(newBlog);
            res.send(result);
        });

        app.get("/users", async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // all blogs
        app.get("/blogs", async (req, res) => {
            const cursor = blogsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // get the trendingBlogs

        app.get("/trendingBlogs", async (req, res) => {
            try {
                const trendingBlogs = await blogsCollection
                    .find({ category: { $regex: "trending", $options: "i" } })
                    .toArray();
                res.send(trendingBlogs);
            } catch (error) {
                res.status(500).send({
                    message: "An error occurred while fetching data.",
                    error,
                });
            }
        });

        // get the latestBlogs

        app.get("/latestBlogs", async (req, res) => {
            try {
                const trendingBlogs = await blogsCollection
                    .find({ category: "Latest" })
                    .toArray();
                res.send(trendingBlogs);
            } catch (error) {
                res.status(500).send({
                    message: "An error occurred while fetching data.",
                    error,
                });
            }
        });


        // get the popularBlogs

        app.get("/popularBlogs", async (req, res) => {
            try {
                const trendingBlogs = await blogsCollection
                    .find({ category: "Popular" })
                    .toArray();
                res.send(trendingBlogs);
            } catch (error) {
                res.status(500).send({
                    message: "An error occurred while fetching data.",
                    error,
                });
            }
        });

        

        app.get("/blogs/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const result = await blogsCollection.findOne(filter);
            res.send(result);
        });

        app.delete("/deleteBlogs/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await blogsCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Diverse blog is running");
});

app.listen(port, () => {
    console.log(`Diverse blog is running on port, ${port}`);
});
