import connectToDatabase from '@/app/lib/db'
import User from '@/app/models/User'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const {
      name,
      email,
      phone,
      password,
      addresses,
      pincode,
      image, // User Image
    } = await req.json()

    if (!name || !email || !phone || !password || !addresses || !pincode) {
      return NextResponse.json(
        {
          success: false,
          message: 'All fields are required',
        },
        { status: 400 }
      )
    }

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

    await User.create({
      name,
      email,
      phone,
      image: image || "",

      password: hashedPassword,
      role: 'customer',

      addresses,
      pincode,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Account created',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Customer register error:', error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}