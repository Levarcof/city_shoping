import connectToDatabase from '@/app/lib/db';
import Shop from '@/app/models/Shop';
import { getUserFromToken } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== 'shop_owner') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id } = await params;
    const shop = await Shop.findById(id);

    if (!shop) return NextResponse.json({ success: false, message: 'Shop not found' }, { status: 404 });
    
    if (shop.owner.toString() !== user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    shop.isActive = !shop.isActive;
    await shop.save();

    return NextResponse.json({ success: true, isActive: shop.isActive });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
