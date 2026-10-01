import SparePart from '../models/SparePart.js';
import PartRequest from '../models/PartRequest.js';
import { catalogController } from './catalogController.js';
export default catalogController({
  Model: SparePart,
  Related: PartRequest,
  referenceField: 'sparePartId',
  nameField: 'partName',
  folder: 'spare-parts',
  label: 'Spare part',
});
