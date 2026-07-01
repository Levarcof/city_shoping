import connectToDatabase from '@/app/lib/db';
import Shop from '@/app/models/Shop';
import { getUserFromToken } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== 'shop_owner') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { shopId, itemId } = await params;

    await connectToDatabase();
    const shop = await Shop.findById(shopId);

    if (!shop || shop.owner.toString() !== user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    shop.items = shop.items.filter(item => item._id.toString() !== itemId);
    await shop.save();

    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== 'shop_owner') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { shopId, itemId } = await params;
    const updateData = await req.json();

    await connectToDatabase();
    const shop = await Shop.findById(shopId);

    if (!shop || shop.owner.toString() !== user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const itemIndex = shop.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex > -1) {
      shop.items[itemIndex] = { ...shop.items[itemIndex].toObject(), ...updateData };
      await shop.save();
    }

    return NextResponse.json({ success: true, item: shop.items[itemIndex] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
