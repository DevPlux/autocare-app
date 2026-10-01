export function listQuery(model, filters, scope = {}, nameField) {
  const { page = 1, limit = 50, search, ...fields } = filters;
  if (search && nameField)
    fields[nameField] = {
      $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
  return model
    .find({ ...fields, ...scope })
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}
