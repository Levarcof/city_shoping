import connectToDatabase from '@/app/lib/db';
import Shop from '@/app/models/Shop';
import { NextResponse } from 'next/server';

export async function GET(req, context) {
  try {
    await connectToDatabase();
    const { id } = await context.params; 

    console.log("owner id:", id);

    const shop = await Shop.findOne({ owner: id }).populate("owner", "name");

    if (!shop) {
      return NextResponse.json(
        { success: false, message: "Shop not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      shop,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}