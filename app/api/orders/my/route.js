import connectToDatabase from "@/app/lib/db";
import Order from "@/app/models/Order";
import Shop from "@/app/models/Shop";
import { getUserFromToken } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const user = getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    let orders = [];
    if (user.role !== "shop_owner") {
      orders = await Order.find({
        customer: user.id,
      })
        .populate("customer", "name email phone")
        .populate("items.shop", "name image")
        .sort({ createdAt: -1 });
    }

    else {
      const shop = await Shop.findOne({
        owner: user.id,
      });

      if (!shop) {
        return NextResponse.json({
          success: true,
          orders: [],
        });
      }

      orders = await Order.find({
        "items.shop": shop._id,
      })
        .populate("customer", "name email phone")
        .populate("items.shop", "name image")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}