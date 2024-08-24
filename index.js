const express = require("express");
const path = require("path");
const { connectToMongoDB } = require("./connect");

// routers
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");

// Model
const URL = require("./models/url");

const app = express();
const PORT = 5000;

connectToMongoDB("mongodb://localhost:27017/short-url").then(() =>
  console.log(`MongoDB Connected...`)
);

app.use("/url", urlRoute);
app.use("/", staticRoute);

// Templating Engine
app.set("view engine", "ejs");

// Set the views folder - for ejs files
app.set("views", path.resolve("./views"));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false}));  // for entering form data

// For getting the Table UI of lists clicked URLs
app.get("/test", async (req, res) => {
  const allUrls = await URL.find({});
  res.render(`home`, {
    urls: allUrls,
  });
});

// For GET/:id
app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  res.redirect(entry.redirectURL);
});

app.listen(PORT, () => {
  console.log(`Server Started at port : ${PORT}`);
});
