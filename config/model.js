import mongoose from "mongoose";
const { Schema, model } = mongoose;

const nftSchema = new Schema({
  tokenId: { type: Number, required: true, unique: true },
  tokenURI: { type: String, required: true },
  owner: { type: String, required: true },
  price: { type: Number, default: 0 },
  isForSale: { type: Boolean, default: false }
});

const Nft = model("Nft", nftSchema);


export { Nft };
