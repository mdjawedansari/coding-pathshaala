import { model, Schema } from 'mongoose';

const paymentSchema = new Schema(
  {
    razorpay_payment_id: {
      type: String,
      required: [true, 'Razorpay payment ID is required'],
      trim: true,
    },
    razorpay_subscription_id: {
      type: String,
      required: [true, 'Razorpay subscription ID is required'],
      trim: true,
    },
    razorpay_signature: {
      type: String,
      required: [true, 'Razorpay signature is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index fields for optimized queries
paymentSchema.index({ razorpay_payment_id: 1 });
paymentSchema.index({ razorpay_subscription_id: 1 });

const Payment = model('Payment', paymentSchema);

export default Payment;
