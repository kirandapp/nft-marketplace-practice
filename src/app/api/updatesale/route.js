import { NextResponse } from "next/server";
import dbConnect from "../../../../config/db";
import { Nft } from "../../../../config/model";

export async function POST(request) {
  try {
    await dbConnect();

    // Extract data from the request's body
    const { tokenId, price, isForSale } = await request.json();
    console.log(" in API - ",tokenId, price, isForSale);

    // Find the NFT with the given tokenId and update its isForSale attribute
    const updatedNFT = await Nft.findOneAndUpdate(
      { tokenId: tokenId },
      {
        $set: {
          price: price,
          isForSale: isForSale
        }
      },
      { new: true } // Return the updated NFT
    );

    if (!updatedNFT) {
      return NextResponse.json({ message: "NFT with this tokenId not found" });
    }

    return NextResponse.json({ message: "NFT updated successfully", nft: updatedNFT });

  } catch (error) {
    console.error("Error updating NFT:", error);
    return NextResponse.json({ message: "Failed to update NFT" });
  }
}