import { NextResponse } from "next/server";
import dbConnect from "../../../../config/db";
import { Nft } from "../../../../config/model";

export async function POST(request) {
  await dbConnect();
  const { tokenId } = await request.json();
  const tokenInfo = await Nft.findOne({
    tokenId
  });
  return NextResponse.json(tokenInfo);
}