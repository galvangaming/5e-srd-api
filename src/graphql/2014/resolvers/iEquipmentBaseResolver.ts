import { resolveEquipmentType } from './common.js';
import { Equipment } from '@/models/2014/equipment/index.js';

const IEquipmentBaseResolver = {
  __resolveType(equipment: Equipment) {
    if (equipment.cost) return resolveEquipmentType(equipment);
    if (equipment.index) return 'MagicItem';
    return null;
  },
};

export default IEquipmentBaseResolver;
