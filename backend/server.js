// Minimal server entry point.
// In prod, Render or other platform injects PORT.

const app = require("./app");
const config = require("./config/env");

app.listen(config.port, () => {
  console.log(`Backend listening on port ${config.port}`);
});
