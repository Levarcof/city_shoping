import connectToDatabase from '@/app/lib/db';
import Order from '@/app/models/Order';
import Cart from '@/app/models/Cart';
import { getUserFromToken } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { isAll, shopId, items, totalAmount, deliveryAddress, paymentMethod, razorpayOrderId, razorpayPaymentId } = await req.json();
 console.log("The id of shop :" ,shopId )
    await connectToDatabase();

    // ऑर्डर का बेसिक डेटा तैयार करें
    const orderData = {
      customer: user.id,
      shop : shopId,
      items: items.map(i => ({
        itemId: i.itemId,
        shop: i.shopId || i.shop, // सुनिश्चित करें कि यहाँ shop की ID सही से मैप हो रही हो
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image
      })),
      totalAmount,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      status: 'placed',
    };

    // अगर यह सिंगल शॉप का ऑर्डर है, तो टॉप-लेवल shop भी सेट कर दें (बैकवर्ड कम्पैटिबिलिटी के लिए)
    if (!isAll && shopId) {
      orderData.shop = shopId;
    }

    if (paymentMethod === 'online') {
      orderData.razorpayOrderId = razorpayOrderId;
      orderData.razorpayPaymentId = razorpayPaymentId;
    }

    const order = await Order.create(orderData);

    // कार्ट को साफ करना: 
    if (isAll) {
      // अगर 'Checkout All' किया है तो पूरी कार्ट खाली कर दें
      await Cart.findOneAndUpdate({ user: user.id }, { $set: { items: [] } });
    } else {
      // अगर किसी एक स्पेसिफिक शॉप का ऑर्डर किया है, तो सिर्फ उस शॉप के आइटम्स को कार्ट से हटाएं
      await Cart.findOneAndUpdate(
        { user: user.id },
        { $pull: { items: { shopId: shopId } } }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}