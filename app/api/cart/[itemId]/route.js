import connectToDatabase from '@/app/lib/db';
import Cart from '@/app/models/Cart';
import { getUserFromToken } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { itemId } = await params;

    if (!itemId) return NextResponse.json({ success: false, message: 'Item ID required' }, { status: 400 });

    await connectToDatabase();
    const cart = await Cart.findOne({ user: user.id })
                 
    if (!cart) return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 });

    cart.items = cart.items.filter(i => i.itemId.toString() !== itemId);
    await cart.save();

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
