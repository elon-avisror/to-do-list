const fs = require("fs").promises;
const bodyParser = require("body-parser");
const express = require("express");
const { fileName } = require("./config.json");

const app = express();
app.use(bodyParser.json());

const store = {
  tdl: [],

  async read() {
    try {
      await fs.access(fileName);
      this.tdl = JSON.parse((await fs.readFile(fileName)).toString());
    } catch (e) {
      console.log(e);
      this.tdl = [];
    }

    return this.tdl;
  },

  async save() {
    try {
      await fs.writeFile(fileName, JSON.stringify(this.tdl));
    } catch (e) {
      console.log(e);
    }
  },

  async getIndexById(id) {
    try {
      const tdl = await this.read();
      return tdl.findIndex(td => td.id === +id);
    } catch (e) {
      throw e;
    }
  },

  async getNextTdlId() {
    let maxId = 0;
    this.tdl.forEach(td => {
      if (td.id > maxId) {
        maxId = td.id;
      }
    });
    return maxId + 1;
  }
};

app.get("/tdl", async (req, res) => {
  res.json(await store.read());
});

app.get("/tdl/:id", async (req, res) => {
  const tdl = await store.read();
  res.json(tdl.find(td => td.id === +req.params.id));
});

app.post("/tdl", async (req, res) => {
  const td = req.body;
  td.id = await store.getNextTdlId();
  store.tdl.push(td);
  await store.save();
  res.send("ok");
});

app.put("/tdl/:id", async (req, res) => {
  const index = await store.getIndexById(req.params.id);
  const { title, completed } = req.body;
  const td = store.tdl[index];

  td.title = title;
  td.completed = completed;

  await store.save();

  res.send("ok");
});

app.delete("/tdl/:id", async (req, res) => {
  const index = await store.getIndexById(req.params.id);
  store.tdl.splice(index, 1);
  await store.save();
  res.send("ok");
});

app.listen(8000, () => {
  console.log("server listen on port 8000!");
});

// TODO: add cache mechanism
