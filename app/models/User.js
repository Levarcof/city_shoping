import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Naam zaroori hai'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email zaroori hai'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Valid email daalo'],
        },
        phone: {
            type: String,
            trim: true,
            match: [/^[6-9]\d{9}$/, 'Valid Indian mobile number daalo'],
        },
        image: { type: String },

        password: {
            type: String,
            required: [true, 'Password zaroori hai'],
            minlength: [6, 'Password kam se kam 6 characters ka hona chahiye'],
            select: false,
        },

        role: {
            type: String,
            enum: ['customer', 'shop_owner', 'admin'],
            default: 'customer',
        },

        addresses: { type: String, required: true, trim: true },
        pincode: { type: String, required: true, trim: true },

        savedShops: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Shop',
            },
        ],
    },
    {
        timestamps: true,
    }
)

export default mongoose.models.User ?? mongoose.model('User', userSchema)