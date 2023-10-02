import { NextResponse } from "next/server";
import dbConnect from "../../../../config/db";
import { Nft } from "../../../../config/model";

export async function POST(request) {
  try {
    await dbConnect();
    console.log("1");
    const body = await request.json();
    console.log("request.body",body);

    // 1. Extract data from the request's body
    const { tokenId, tokenURI, owner, price, isForSale } = body;
    console.log("\ntokenId, tokenURI, owner, price, isForSale",tokenId, tokenURI, owner, price, isForSale);
    console.log("2");

    // 2. Check if NFT with the given tokenId already exists
    const existingNFT = await Nft.findOne({ tokenId: tokenId });
    console.log("3");

    if (existingNFT) {
      return NextResponse.json({ message: "NFT with this tokenId already exists" });
    }

    // 3. Create a new NFT instance
    const newNFT = new Nft({
      tokenId: tokenId,
      tokenURI: tokenURI,
      owner: owner,
      price: price,
      isForSale: isForSale
    });
    console.log("4");

    // 4. Save the NFT to the database
    await newNFT.save();
    console.log("5");

    return NextResponse.json({ message: "success" });
    
  } catch (error) {
    console.log("\nError - ",error);
    return NextResponse.json({ message: "fail" });
  }
}
