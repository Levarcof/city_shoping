import connectToDatabase from "@/app/lib/db";
import Shop from "@/app/models/Shop";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");

    const lat = parseFloat(searchParams.get("lat"));
    const lng = parseFloat(searchParams.get("lng"));
    const radius = parseFloat(searchParams.get("radius"));

    const search = searchParams.get("search");

    const query = {};

    if (category && category !== "All categories") {
      query.category = category;
    }

    if (
      subcategory &&
      subcategory.trim() !== "" &&
      subcategory !== "null" &&
      subcategory !== "undefined"
    ) {
      query.subcategories = subcategory;
    }

    if (search && search.trim() !== "") {
      query.$text = {
        $search: search,
      };
    }

    if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radius * 1000,
        },
      };
    }

    let shops = await Shop.find(query).populate("owner", "name");

    if (!isNaN(lat) && !isNaN(lng)) {
      shops = shops.map((shop) => {
        const doc = shop.toObject();

        if (doc.location?.coordinates?.length === 2) {
          const shopLng = doc.location.coordinates[0];
          const shopLat = doc.location.coordinates[1];

          const distance =
            6371 *
            Math.acos(
              Math.cos((lat * Math.PI) / 180) *
                Math.cos((shopLat * Math.PI) / 180) *
                Math.cos(((shopLng - lng) * Math.PI) / 180) +
                Math.sin((lat * Math.PI) / 180) *
                  Math.sin((shopLat * Math.PI) / 180)
            );

          doc.distance = distance;
        }

        return doc;
      });
    }

    return NextResponse.json({
      success: true,
      count: shops.length,
      shops,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}