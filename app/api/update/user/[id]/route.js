import connectToDatabase from '@/app/lib/db';
import User from '@/app/models/User';
import { NextResponse } from 'next/server';

export async function PATCH(req, context) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    console.log("Id : ",id)
    const body   = await req.json();

    const allowedFields = ["name", "phone", "addresses", "pincode", "image"];
    const updates = {};
    allowedFields.forEach((key) => {
      if (body[key] !== undefined) updates[key] = body[key];
    });

    delete updates.email;
    delete updates.password;
    delete updates.role;
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;

    if (updates.name !== undefined && !String(updates.name).trim()) {
      return NextResponse.json(
        { success: false, message: "Name required hai" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: false }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User nahi mila" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile successfully update ho gayi",
      user: updatedUser,
    });

  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}