import Razorpay from 'razorpay';
import { getUserFromToken } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { amount } = await req.json();

    const instance = new Razorpay({ 
      key_id:  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
      key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET 
    });

    const order = await instance.orders.create({ 
      amount: Math.round(amount * 100), 
      currency: 'INR', 
      receipt: 'receipt_' + Date.now() 
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order.id, 
      amount: order.amount, 
      currency: order.currency 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
