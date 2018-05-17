var mongoose = require("mongoose");
var mongoosastic = require("mongoosastic");
var Schema = mongoose.Schema;


var ProductSchema = new Schema({
	category: { type: Schema.Types.ObjectId, ref: "Category"},
	name: String,
	price: {type: Number, default: 0},
	image: {type : String, default: "https://lol.gamepedia.com/media/lol.gamepedia.com/d/d4/Logo.jpg"},
	comments:[{
		type: Schema.Types.ObjectId,
		ref: "Comment"
	}]
});

ProductSchema.plugin(mongoosastic, {
	hosts: [
	"localhost:9200"
	]
});

module.exports = mongoose.model("Product", ProductSchema);