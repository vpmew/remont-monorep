require("dotenv").config();
const app = require("app");

const port = process.env.SERVER_PORT || 5000;

app.listen(port, () => console.log(`[Web-server]: Listening on ${port}`));
