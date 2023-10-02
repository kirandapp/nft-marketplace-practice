import { NextResponse } from "next/server";
import dbConnect from "../../../../config/db";
import { Nft } from "../../../../config/model";

export async function POST() {
  await dbConnect();
  const nfts = await Nft.find();
  return NextResponse.json(nfts);
}