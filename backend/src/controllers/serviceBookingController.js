import Service from '../models/Service.js';
import ServiceBooking from '../models/ServiceBooking.js';
import { authorizeOwner } from '../middleware/authMiddleware.js';
import { transaction, lockParent } from '../utils/transaction.js';
import { listQuery } from '../utils/query.js';
import { ApiError, success } from '../utils/apiResponse.js';

const transitions = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};
export async function list(req, res) {
  return success(
    res,
    'Bookings retrieved',
    await listQuery(
      ServiceBooking,
      req.filters,
      req.user.isAdmin ? {} : { userId: req.user._id },
    ),
  );
}
export async function detail(req, res) {
  return success(
    res,
    'Booking retrieved',
    authorizeOwner(await ServiceBooking.findById(req.params.id), req.user),
  );
}
export async function create(req, res) {
  const record = await transaction(async (session) => {
    await lockParent(Service, req.body.serviceId, session);
    const [booking] = await ServiceBooking.create(
      [{ ...req.body, userId: req.user._id }],
      { session },
    );
    return booking;
  });
  return success(res, 'Booking created successfully', record, 201);
}
export async function update(req, res) {
  const record = await transaction(async (session) => {
    const booking = authorizeOwner(
      await ServiceBooking.findById(req.params.id).session(session),
      req.user,
    );
    if (booking.status !== 'PENDING')
      throw new ApiError(409, 'Only pending bookings can be edited');
    const ids = [
      ...new Set(
        [String(booking.serviceId), req.body.serviceId].filter(Boolean),
      ),
    ].sort();
    for (const id of ids) await lockParent(Service, id, session);
    Object.assign(booking, req.body);
    return booking.save({ session });
  });
  return success(res, 'Booking updated successfully', record);
}
export async function changeStatus(req, res) {
  const record = await transaction(async (session) => {
    const booking = authorizeOwner(
      await ServiceBooking.findById(req.params.id).session(session),
      req.user,
    );
    const service = await lockParent(Service, booking.serviceId, session);
    const target = req.body.status;
    if (booking.status === target) return booking;
    if (!transitions[booking.status].includes(target))
      throw new ApiError(409, `Cannot change ${booking.status} to ${target}`);
    if (target === 'CONFIRMED') {
      if (service.availabilityStatus !== 'AVAILABLE')
        throw new ApiError(409, 'Service is unavailable');
      const confirmed = await ServiceBooking.countDocuments({
        serviceId: service._id,
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
        status: 'CONFIRMED',
      }).session(session);
      if (confirmed >= service.slotCapacity)
        throw new ApiError(409, 'Selected time slot is full');
    }
    booking.status = target;
    return booking.save({ session });
  });
  return success(res, 'Booking status updated successfully', record);
}
export async function remove(req, res) {
  const result = await transaction(async (session) => {
    const booking = authorizeOwner(
      await ServiceBooking.findById(req.params.id).session(session),
      req.user,
    );
    await lockParent(Service, booking.serviceId, session);
    if (booking.status === 'COMPLETED')
      throw new ApiError(409, 'Completed bookings cannot be deleted');
    if (booking.status === 'CONFIRMED') {
      booking.status = 'CANCELLED';
      await booking.save({ session });
      return booking;
    }
    await booking.deleteOne({ session });
    return null;
  });
  return success(
    res,
    result ? 'Booking cancelled successfully' : 'Booking deleted successfully',
    result,
  );
}
