const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const { readdirSync } = require('fs');
require('dotenv').config()


//import routes from
//const authRoutes = require('./routes/auth')

// application
const app = express()

// db connection
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
})
    .then(() => console.log('BD CONNECTED'))
    .catch(err => console.log(`DB CONNECTION ERR`, err));

// middlewares
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "2mb" }));
app.use(cors());

// routes midd
readdirSync("./routes").map((r) =>
    app.use("/api", require("./routes/" + r)));

// port   as
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server is running on port ${port}`));