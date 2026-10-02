import { ApiError, success } from '../utils/apiResponse.js';
import { listQuery } from '../utils/query.js';
import { transaction, lockParent } from '../utils/transaction.js';
import { removeImage } from '../config/cloudinary.js';

export function catalogController({
  Model,
  Related,
  referenceField,
  nameField,
  folder,
  label,
  validateUpdate,
}) {
  return {
    async list(req, res) {
      return success(
        res,
        `${label} list retrieved`,
        await listQuery(Model, req.filters, {}, nameField),
      );
    },
    async detail(req, res) {
      const record = await Model.findById(req.params.id);
      if (!record) throw new ApiError(404, `${label} not found`);
      return success(res, `${label} retrieved`, record);
    },
    async create(req, res) {
      const storage = req.app.locals.imageStorage;
      const image = req.file
        ? await storage.upload(req.file.buffer, folder)
        : {};
      let record;
      try {
        record = await Model.create({ ...req.body, ...image });
      } catch (error) {
        await removeImage(storage, image.imagePublicId);
        throw error;
      }
      return success(res, `${label} created successfully`, record, 201);
    },
    async update(req, res) {
      const storage = req.app.locals.imageStorage;
      const image = req.file
        ? await storage.upload(req.file.buffer, folder)
        : {};
      let previousImage;
      let record;
      try {
        record = await transaction(async (session) => {
          const current = await lockParent(Model, req.params.id, session);
          if (validateUpdate) await validateUpdate(current, req.body, session);
          previousImage = current.imagePublicId;
          Object.assign(current, req.body, image);
          return current.save({ session });
        });
      } catch (error) {
        await removeImage(storage, image.imagePublicId);
        throw error;
      }
      if (image.imagePublicId) await removeImage(storage, previousImage);
      return success(res, `${label} updated successfully`, record);
    },
    async remove(req, res) {
      let previousImage;
      await transaction(async (session) => {
        const current = await lockParent(Model, req.params.id, session);
        if (
          await Related.exists({ [referenceField]: current._id }).session(
            session,
          )
        )
          throw new ApiError(
            409,
            `${label} has related records and cannot be deleted`,
          );
        previousImage = current.imagePublicId;
        await current.deleteOne({ session });
      });
      await removeImage(req.app.locals.imageStorage, previousImage);
      return success(res, `${label} deleted successfully`, null);
    },
  };
}
