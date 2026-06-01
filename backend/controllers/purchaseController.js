import Purchase from '../models/Purchase.js';
import Payment from '../models/Payment.js';
import PackageExercise from '../models/PackageExercise.js';
import { PAYMENT_STATUS } from '../constants/index.js';

// Enrich a populated Package document with its exercises from PackageExercise.
// Mirrors the same helper in packageController so the shape is identical
// whether you fetch a package directly or via a purchase.
const enrichPackageWithExercises = async (pkg) => {
  const packageExercises = await PackageExercise.find({ packageId: pkg._id, isActive: true })
    .populate('exerciseId')
    .sort({ order: 1 });

  return {
    ...pkg.toObject(),
    exercises: packageExercises
      .filter(pe => pe.exerciseId)
      .map(pe => ({
        _id: pe.exerciseId._id,
        name: pe.exerciseId.name,
        muscleGroup: pe.exerciseId.muscleGroup,
        image: pe.exerciseId.image,
        description: pe.exerciseId.description,
        steps: pe.exerciseId.steps,
        beginnerReps: pe.exerciseId.beginnerReps,
        intermediateReps: pe.exerciseId.intermediateReps,
        advancedReps: pe.exerciseId.advancedReps,
        packageConfig: {
          reps: pe.reps,
          sets: pe.sets,
          restTime: pe.restTime,
          duration: pe.duration,
          difficulty: pe.difficulty,
          notes: pe.notes,
          order: pe.order,
        },
      })),
  };
};

export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('userId', 'name email')
      .populate('packageId', 'name price');
    res.status(200).json({ count: purchases.length, purchases });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchases' });
  }
};

/**
 * GET /api/purchases/my-purchases
 *
 * FIX: After populating `packageId` we now enrich each package with its
 * exercises from the PackageExercise collection, exactly the way
 * packageController does. Previously `packageId.exercises` was always
 * undefined (the Package model has no embedded exercises field), causing
 * "Total Exercises: 0" and empty workout lists on Dashboard / MyPackage.
 */
export const getMyPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.userId }).populate('packageId');

    // Enrich every purchase's package with its exercises
    const enrichedPurchases = await Promise.all(
      purchases.map(async (purchase) => {
        const purchaseObj = purchase.toObject();
        if (purchaseObj.packageId) {
          purchaseObj.packageId = await enrichPackageWithExercises(purchase.packageId);
        }
        return purchaseObj;
      })
    );

    res.status(200).json({ purchases: enrichedPurchases });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your purchases' });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const { packageId, price } = req.body;
    const purchase = new Purchase({ userId: req.userId, packageId, price });
    await purchase.save();
    res.status(201).json({ message: 'Purchase successful', purchase });
  } catch (error) {
    res.status(500).json({ message: 'Error processing purchase' });
  }
};

export const updatePurchaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
    res.status(200).json({ message: 'Purchase updated', purchase });
  } catch (error) {
    res.status(500).json({ message: 'Error updating purchase status' });
  }
};

export const createPurchaseWithPayment = async (req, res) => {
  try {
    const { packageId, paymentIntentId } = req.body;

    if (!packageId || !paymentIntentId) {
      return res.status(400).json({ message: 'Package ID and payment Intent ID are required' });
    }

    const payment = await Payment.findOne({ stripePaymentId: paymentIntentId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status !== PAYMENT_STATUS.COMPLETED) {
      return res.status(400).json({ message: 'Payment has not been completed' });
    }

    const existingPurchase = await Purchase.findOne({ paymentId: payment._id });
    if (existingPurchase) {
      return res.status(200).json({ message: 'Purchase already recorded', purchase: existingPurchase });
    }

    const purchase = new Purchase({
      userId: req.userId,
      packageId,
      price: payment.amount,
      status: 'paid',
      paymentId: payment._id,
    });
    await purchase.save();

    return res.status(201).json({ message: 'Purchase recorded successfully', purchase });
  } catch (error) {
    return res.status(500).json({
      message: 'Error recording purchase with payment',
      error: error.message,
    });
  }
};
