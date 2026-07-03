import { NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/db";   
import Order from "@/app/models/Order";        

const VALID_STATUSES = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];
const VALID_PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export async function PATCH(req, context) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    const body = await req.json();

    const updates = {};

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    if (body.paymentStatus !== undefined) {
      if (!VALID_PAYMENT_STATUSES.includes(body.paymentStatus)) {
        return NextResponse.json(
          { success: false, message: `Invalid paymentStatus. Must be one of: ${VALID_PAYMENT_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      updates.paymentStatus = body.paymentStatus;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update" },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true } 
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error("Order update error:", err);
    return NextResponse.json(
      { success: false, message: "Server error while updating order" },
      { status: 500 }
    );
  }
}

export async function PUT(req, ctx) {
  return PATCH(req, ctx);
}