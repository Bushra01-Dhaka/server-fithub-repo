const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u9lypro.mongodb.net/?retryWrites=true&w=majority`;

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

    const classesCollection = client.db("fithubDB").collection("classes");
    const photoCollection = client.db("fithubDB").collection("gallery");
    const trainerCollection = client.db("fithubDB").collection("trainers");
    const newsletterCollection = client.db("fithubDB").collection("newsletter");
    const trainerPackageCollection = client.db("fithubDB").collection("packages");
    const blogCollection = client.db("fithubDB").collection("blogs");
    const userCollection = client.db("fithubDB").collection("users");



    //users related api 
    app.post('/users', async(req, res) => {
      const user = req.body;
      //insert email jodi user na thake
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get('/users', async(req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })


    app.patch("/users/admin/:id", async(req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDocs = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDocs);
      res.send(result);

    })





    //blog api
    app.get("/blogs", async (req, res) => {
      const result = await blogCollection.find().toArray();
      res.send(result);
    });


    //package Api
    app.post('/packages', async(req, res) => {
      const package = req.body;
      const result = await trainerPackageCollection.insertOne(package);
      res.send(result);
    });

    app.get('/packages', async(req, res) => {
      const email = req.query.email;
      const query = {userEmail : email}
      const result = await trainerPackageCollection.find(query).toArray();
      res.send(result);
    })

    //newsletter api
    app.post("/newsletter", async(req, res) => {
      const subscriber = req.body;
      const result = await newsletterCollection.insertOne(subscriber);
      res.send(result);
    });

    app.get("/newsletter", async(req, res) => {
      const result = await newsletterCollection.find().toArray();
      res.send(result);
    })

    //trainer api
    app.post('/trainers', async(req, res) => {
      const trainer = req.body;
      const result = await trainerCollection.insertOne(trainer);
      res.send(result);
    })

    app.get("/trainers", async (req, res) => {
      const result = await trainerCollection.find().toArray();
      res.send(result);
    });

    app.get("/trainers/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await trainerCollection.findOne(query);
      res.send(result);
    })

    

    //gallery api with pagination
    const PAGE_SIZE = 12; // Adjust this value based on the number of images you want to fetch per page

    app.get("/gallery", async (req, res) => {
      const { page = 1 } = req.query;
      const skip = (page - 1) * PAGE_SIZE;

      try {
        const result = await photoCollection
          .find()
          .skip(skip)
          .limit(PAGE_SIZE)
          .toArray();
        res.json({ images: result });
      } catch (error) {
        console.error("Error fetching images:", error);
        // res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    //classes api
    app.get("/classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    app.get("/classes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.findOne(query);
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

app.get("/", async (req, res) => {
  res.send("FitHub is running");
});

app.listen(port, () => {
  console.log(`FitHub is running on port: ${port}`);
});
