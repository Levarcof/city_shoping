// PATH: /app/api/update/product/route.js
import connectToDatabase from '@/app/lib/db';
import Shop from '@/app/models/Shop';
import { NextResponse } from 'next/server';

export async function PATCH(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { shopId, itemId, ...updates } = body;

    if (!shopId || !itemId) {
      return NextResponse.json(
        { success: false, message: "shopId aur itemId required hai" },
        { status: 400 }
      );
    }

    delete updates._id;

    if (updates.name !== undefined && !String(updates.name).trim()) {
      return NextResponse.json(
        { success: false, message: "Product name required hai" },
        { status: 400 }
      );
    }
    if (updates.price !== undefined) {
      const price = Number(updates.price);
      if (Number.isNaN(price) || price < 0) {
        return NextResponse.json(
          { success: false, message: "Valid price required hai" },
          { status: 400 }
        );
      }
      updates.price = price;
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return NextResponse.json(
        { success: false, message: "Shop nahi mili" },
        { status: 404 }
      );
    }

    const item = shop.items.id(itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, message: "Product nahi mila" },
        { status: 404 }
      );
    }

    const allowedFields = ["name", "subcat", "description", "price", "unit", "image", "inStock"];
    allowedFields.forEach((key) => {
      if (updates[key] !== undefined) {
        item[key] = updates[key];
      }
    });

    await shop.save();

    return NextResponse.json({
      success: true,
      message: "Product successfully update ho gaya",
      item,
    });

  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}