import mongoose from 'mongoose'
import { VALID_CATEGORIES, getValidSubcategories } from '../constants/shopCategories.js'

const itemSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  subcat:        { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price:       { type: Number, required: true, min: 0 },
  unit:        { type: String, trim: true },       
  image:       { type: String },                    
  inStock:     { type: Boolean, default: true },
}, { _id: true })


const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    category: {
      type: String,
      required: [true],
      enum: {
        values: VALID_CATEGORIES,
        message: '"{VALUE}" ek valid category nahi hai',
      },
    },

    subcategories: {
      type: [String],
      required: true,
      validate: [
        {
          validator: (arr) => arr.length >= 1,
          message: 'Kam se kam ek subcategory select karni zaroori hai',
        },
        {
          validator: function (arr) {
            const validSubs = getValidSubcategories(this.category)
            return arr.every((sub) => validSubs.includes(sub))
          },
          message: 'Kuch subcategories is category ke liye valid nahi hain',
        },
      ],
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],   
        required: [true],
      },
      address:  { type: String, trim: true },
      city:     { type: String, trim: true },
      pincode:  { type: String, trim: true },
    },

    images: [{ type: String }],    
    thumbnail: { type: String },   

    items: [itemSchema],

    openTime:  { type: String, default: '09:00' },
    closeTime: { type: String, default: '21:00' },
    closedOn: {
      type: [String],
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      default: [],
    },

    phone:   { type: String, trim: true },
    whatsapp: { type: String, trim: true },

    isActive:   { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },

    avgRating:   { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
  },
  {
    timestamps: true,  
  }
)

shopSchema.index({ location: '2dsphere' })

shopSchema.index({ name: 'text', description: 'text' })

export default mongoose.models.Shop ?? mongoose.model('Shop', shopSchema)