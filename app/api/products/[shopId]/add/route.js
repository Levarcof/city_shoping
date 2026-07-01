import connectToDatabase from '@/app/lib/db';
import Shop from '@/app/models/Shop';
import { getUserFromToken } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  try {
    await connectToDatabase();

    const { shopId } = await params;

    const user = await getUserFromToken(req);
    if (!user || user.role !== 'shop_owner') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, description, price, unit, image, inStock, subCategory } = body;

    if (!name || price == null || !unit) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return NextResponse.json(
        { success: false, message: 'Shop not found' },
        { status: 404 }
      );
    }

    if (shop.owner.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    // ❌ subCategory validation completely remove kar diya
    // Ab koi bhi category enter kar sakte ho

    const newItem = {
      name,
      description,
      price: Number(price),
      unit,
      image,
      inStock: inStock ?? true,
      subcat: subCategory ?? '',   // empty string agar na bhejo toh
    };

    shop.items.push(newItem);
    await shop.save();

    return NextResponse.json({
      success: true,
      item: shop.items[shop.items.length - 1],
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}