import connectToDatabase from '@/app/lib/db';
import User from '@/app/models/User';
import { getUserFromToken } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

const SHOP_SELECT = 'name images thumbnail category location avgRating totalRatings isVerified openTime closeTime closedOn';
export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { shopId } = await req.json();
    if (!shopId) {
      return NextResponse.json({ success: false, message: 'Shop id required' }, { status: 400 });
    }

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $addToSet: { savedShops: shopId } },
      { new: true }
    ).populate('savedShops', SHOP_SELECT);

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, savedShops: updatedUser.savedShops });
  } catch (error) {
    console.error('SAVE SHOP ERROR:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const user = getUserFromToken(req);
    console.log("user : " , user)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const dbUser = await User.findById(user.id).populate('savedShops', SHOP_SELECT);
    if (!dbUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, savedShops: dbUser.savedShops });
  } catch (error) {
    console.error('FETCH SAVED SHOPS ERROR:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}