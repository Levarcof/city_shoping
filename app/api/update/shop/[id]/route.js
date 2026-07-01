// PATH: /app/api/update/shop/[id]/route.js

import connectToDatabase from '@/app/lib/db';
import Shop from '@/app/models/Shop';
import { NextResponse } from 'next/server';

async function updateShopHandler(req, context) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    const body   = await req.json();

    // ── Sensitive fields jo kabhi update nahi hone chahiye ──────────────────
    delete body.owner;
    delete body.isVerified;
    delete body.isActive;
    delete body.avgRating;
    delete body.totalRatings;
    delete body.items;
    delete body._id;
    delete body.__v;
    delete body.createdAt;

    // ── Validate: name required ─────────────────────────────────────────────
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, message: "Shop name required hai" },
        { status: 400 }
      );
    }

    // ── Location: coordinates preserve karo ────────────────────────────────
    if (body.location) {
      const existingShop = await Shop.findById(id).select('location');
      if (existingShop?.location?.coordinates) {
        body.location.type        = existingShop.location.type || 'Point';
        body.location.coordinates = existingShop.location.coordinates;
      }
    }

    // ── Images / thumbnail: explicitly allow these fields ──────────────────
    // (body.images aur body.thumbnail already $set me chale jayenge,
    // koi extra handling ki zaroorat nahi — bas confirm kar rahe hain ki
    // delete na ho gaye ho upar)

    // ── Update shop ─────────────────────────────────────────────────────────
    const updatedShop = await Shop.findByIdAndUpdate(
      id,
      { $set: body },
      {
        new:           true,
        runValidators: false,
      }
    ).populate('owner', 'name email');

    if (!updatedShop) {
      return NextResponse.json(
        { success: false, message: "Shop nahi mili" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Shop successfully update ho gayi",
      shop:    updatedShop,
    });

  } catch (error) {
    console.error("Shop update error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, context) {
  return updateShopHandler(req, context);
}

export async function PATCH(req, context) {
  return updateShopHandler(req, context);
}