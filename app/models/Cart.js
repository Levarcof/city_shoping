import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true,
    },
    items: [
      {
        shopId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Shop',
        },
        itemId: mongoose.Schema.Types.ObjectId,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
        shopName: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);
