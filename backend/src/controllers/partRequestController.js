import SparePart from '../models/SparePart.js';
import PartRequest from '../models/PartRequest.js';
import { authorizeOwner } from '../middleware/authMiddleware.js';
import { transaction, lockParent } from '../utils/transaction.js';
import { listQuery } from '../utils/query.js';
import { ApiError, success } from '../utils/apiResponse.js';

const transitions = {
  PENDING: ['APPROVED', 'ISSUED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['ISSUED', 'REJECTED', 'CANCELLED'],
  ISSUED: [],
  REJECTED: [],
  CANCELLED: [],
};
export async function list(req, res) {
  return success(
    res,
    'Part requests retrieved',
    await listQuery(
      PartRequest,
      req.filters,
      req.user.isAdmin ? {} : { userId: req.user._id },
    ),
  );
}
export async function detail(req, res) {
  return success(
    res,
    'Part request retrieved',
    authorizeOwner(await PartRequest.findById(req.params.id), req.user),
  );
}
export async function create(req, res) {
  const record = await transaction(async (session) => {
    await lockParent(SparePart, req.body.sparePartId, session);
    const [request] = await PartRequest.create(
      [{ ...req.body, userId: req.user._id }],
      { session },
    );
    return request;
  });
  return success(res, 'Part request created successfully', record, 201);
}
export async function update(req, res) {
  const record = await transaction(async (session) => {
    const request = authorizeOwner(
      await PartRequest.findById(req.params.id).session(session),
      req.user,
    );
    if (request.status !== 'PENDING')
      throw new ApiError(409, 'Only pending part requests can be edited');
    const ids = [
      ...new Set(
        [String(request.sparePartId), req.body.sparePartId].filter(Boolean),
      ),
    ].sort();
    for (const id of ids) await lockParent(SparePart, id, session);
    Object.assign(request, req.body);
    return request.save({ session });
  });
  return success(res, 'Part request updated successfully', record);
}
export async function changeStatus(req, res) {
  const record = await transaction(async (session) => {
    const request = authorizeOwner(
      await PartRequest.findById(req.params.id).session(session),
      req.user,
    );
    const part = await lockParent(SparePart, request.sparePartId, session);
    const target = req.body.status;
    if (request.status === target) return request;
    if (!transitions[request.status].includes(target))
      throw new ApiError(409, `Cannot change ${request.status} to ${target}`);
    if (target === 'ISSUED') {
      if (request.quantity > part.stockQuantity)
        throw new ApiError(409, 'Insufficient stock');
      part.stockQuantity -= request.quantity;
      await part.save({ session });
    }
    request.status = target;
    return request.save({ session });
  });
  return success(res, 'Part request status updated successfully', record);
}
export async function remove(req, res) {
  const result = await transaction(async (session) => {
    const request = authorizeOwner(
      await PartRequest.findById(req.params.id).session(session),
      req.user,
    );
    await lockParent(SparePart, request.sparePartId, session);
    if (request.status === 'ISSUED')
      throw new ApiError(409, 'Issued requests cannot be deleted');
    if (request.status === 'APPROVED') {
      request.status = 'CANCELLED';
      await request.save({ session });
      return request;
    }
    await request.deleteOne({ session });
    return null;
  });
  return success(
    res,
    result
      ? 'Part request cancelled successfully'
      : 'Part request deleted successfully',
    result,
  );
}
