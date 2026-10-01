import Service from '../models/Service.js';
import ServiceBooking from '../models/ServiceBooking.js';
import { catalogController } from './catalogController.js';
import { ApiError } from '../utils/apiResponse.js';

export default catalogController({
  Model: Service,
  Related: ServiceBooking,
  referenceField: 'serviceId',
  nameField: 'serviceName',
  folder: 'services',
  label: 'Service',
  async validateUpdate(current, changes, session) {
    if (
      changes.slotCapacity !== undefined &&
      changes.slotCapacity < current.slotCapacity
    ) {
      const fullSlots = await ServiceBooking.aggregate([
        { $match: { serviceId: current._id, status: 'CONFIRMED' } },
        {
          $group: {
            _id: { bookingDate: '$bookingDate', timeSlot: '$timeSlot' },
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gt: changes.slotCapacity } } },
        { $limit: 1 },
      ]).session(session);
      if (fullSlots.length)
        throw new ApiError(
          409,
          'Capacity cannot be reduced below existing confirmed bookings',
        );
    }
  },
});
