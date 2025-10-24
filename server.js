const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: { origin: "*" } // allow connections from anywhere
});

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

io.on("connection", (socket) => {
  console.log("A user connected");

  // Sync checkbox state
  socket.on("checkboxChanged", (data) => {
    socket.broadcast.emit("updateCheckbox", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
