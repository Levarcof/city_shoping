// FILE PATH (exact, case-sensitive): app/api/savedShop/delete/[shopId]/route.js
// NOTE: the folder MUST be literally named [shopId] (square brackets included).

import connectToDatabase from '@/app/lib/db';
import User from '@/app/models/User';
import { getUserFromToken } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

// DELETE /api/savedShop/delete/:shopId
// Removes a shop from the logged-in user's savedShops list.
export async function DELETE(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { shopId } = await params;
    if (!shopId) {
      return NextResponse.json({ success: false, message: 'Shop id required' }, { status: 400 });
    }

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $pull: { savedShops: shopId } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Shop removed from saved list' });
  } catch (error) {
    console.error('UNSAVE SHOP ERROR:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}