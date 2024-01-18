const mongoose = require("mongoose");

const ClothingArticleSchema = new mongoose.Schema({
  userId: String,
  name: String,
  type: String,
  color: String,
  max_wears: Number,
  current_wears: Number,
  tags: Array,
  min_temp: Number,
  max_temp: Number,
});

// compile model from schema
module.exports = mongoose.model("clothingarticle", ClothingArticleSchema);