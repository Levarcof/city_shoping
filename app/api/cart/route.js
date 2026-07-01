import connectToDatabase from '@/app/lib/db';
import Cart from '@/app/models/Cart';
import { getUserFromToken } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    let cart = await Cart.findOne({ user: user.id });
    if (!cart) cart = await Cart.create({ user: user.id, items: [] });

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const item = await req.json();

    await connectToDatabase();
    let cart = await Cart.findOne({ user: user.id });
    if (!cart) cart = new Cart({ user: user.id, items: [] });

    const existingIndex = cart.items.findIndex(i => i.itemId.toString() === item.itemId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += item.quantity || 1;
    } else {
      cart.items.push(item);
    }

    await cart.save();
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { itemId, quantity } = await req.json();
    if (!itemId) return NextResponse.json({ success: false, message: 'Item ID required' }, { status: 400 });

    await connectToDatabase();
    let cart = await Cart.findOne({ user: user.id });
    if (!cart) return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 });

    const item = cart.items.find(i => i.itemId.toString() === itemId);
    if (item) {
      item.quantity = quantity;
      await cart.save();
    }

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
