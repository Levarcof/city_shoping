import connectToDatabase from '@/app/lib/db'
import User from '@/app/models/User'
import Shop from '@/app/models/Shop'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { user, shop } = await req.json()

    if (!user || !shop) {
      return NextResponse.json(
        {
          success: false,
          message: 'User and Shop data are required',
        },
        { status: 400 }
      )
    }

    const {
      name,
      email,
      phone,
      password,
      image, 
    } = user

    const {
      name: shopName,
      description,
      category,
      subcategories,
      location,
      phone: shopPhone,
      whatsapp,
      openTime,
      closeTime,
      closedOn,
      images = [],      
      thumbnail = '',   
    } = shop

    await connectToDatabase()

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email already exists',
        },
        { status: 409 }
      )
    }

    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      name,
      email,
      phone,
      image: image || '',

      password: hashedPassword,
      role: 'shop_owner',

      addresses: location?.address || 'Shop Address',
      pincode: location?.pincode || '000000',
    })

    const newShop = new Shop({
      name: shopName,
      description,
      owner: newUser._id,

      category,
      subcategories,

      location: {
        type: 'Point',
        coordinates: [
          Number(location?.coordinates?.[0]),
          Number(location?.coordinates?.[1]),
        ],
        address: location?.address,
        city: location?.city,
        pincode: location?.pincode,
      },

      images,
      thumbnail,

      phone: shopPhone,
      whatsapp,
      openTime,
      closeTime,
      closedOn,
    })

    try {
      await newUser.save()
      await newShop.save()
    } catch (saveError) {
      if (newUser._id) {
        await User.findByIdAndDelete(newUser._id)
      }
      throw saveError
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Shop registered',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Owner register error:', error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}