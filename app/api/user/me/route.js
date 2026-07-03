import connectToDatabase from '@/app/lib/db';
import User from '@/app/models/User';
import { getUserFromToken } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const userToken = await getUserFromToken(req);

    if (!userToken || !userToken.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(userToken.id).select('name email role image phone pincode savedShops');

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id:    user._id.toString(),  
        name:  user.name,
        email: user.email,
        role:  user.role,
        phone : user.phone,
        pincode : user.pincode,
        savedShops : user.savedShops,
        image: user.image || '',
      }
    });
  } catch (error) {
    console.error('API Error [/api/user/me]:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}