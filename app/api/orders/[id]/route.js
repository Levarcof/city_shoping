import connectToDatabase from "@/app/lib/db";
import Order from "@/app/models/Order";
import { getUserFromToken } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params; // ✅ correct way

    console.log("owner id:", id);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Order id missing" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const order = await Order.findById(id)
      .populate("customer", "name email phone")
      .populate("items.shop", "name image");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // 🔒 security: only owner or customer can see order
    if (
      order.customer._id.toString() !== user.id &&
      user.role !== "shop_owner"
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("ORDER DETAIL ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}