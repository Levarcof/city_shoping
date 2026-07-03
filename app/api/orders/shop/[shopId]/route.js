import connectToDatabase from '@/app/lib/db';
import Order from '@/app/models/Order';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(req, context) {
  try {
    await connectToDatabase();
    const { shopId } = await context.params;

    console.log( "The Shop id :" ,shopId)

    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid shopId' },
        { status: 400 }
      );
    }

    const orders = await Order.find({ shop: shopId })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((o) => ({
      _id: o._id,
      status: o.status,
      createdAt: o.createdAt,

      customer: {
        name: o.customer?.name,
        phone: o.customer?.phone,
      },
      deliveryAddress : o.deliveryAddress,
      paymentMethod : o.paymentMethod,

      total: o.totalAmount, 

      items: o.items.map((i) => ({
        name: i.name,
        price: i.price,
        qty: i.quantity,
        image: i.image,
      })),
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}