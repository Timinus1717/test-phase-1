
import { Floor, InventoryItem, GameObject } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const TILE_SIZE = 40;
export const PLAYER_SPEED = 4;

export const ITEMS: Record<string, InventoryItem> = {
  WATER: { id: 'WATER', name: 'Bonaqua Water', price: 10, description: 'Cool and refreshing.', consumable: true, leavesTrash: true },
  CHIPS: { id: 'CHIPS', name: 'Calbee Chips', price: 15, description: 'Salty hot & spicy chips.', consumable: true, leavesTrash: true },
  MEDICINE: { id: 'MEDICINE', name: 'Grandma Medicine', price: 200, description: 'Essential prescription from Mannings.' },
  COFFEE: { id: 'COFFEE', name: "Timothy's Coffee", price: 45, description: 'Double shot espresso.', consumable: true, leavesTrash: true },
  DONUT: { id: 'DONUT', name: 'Chocolate Doughnut', price: 25, description: 'Glazed with sprinkles.', consumable: true, leavesTrash: true },
  LEGO: { id: 'LEGO', name: 'Lego Star Wars Set (Advanced)', price: 499, description: 'Ultimate Collector Series.' },
  TRASH: { id: 'TRASH', name: 'Rubbish', price: 0, description: 'Needs a bin.' },
  BOTTLE: { id: 'BOTTLE', name: 'Empty Bottle', price: 0, description: 'Recyclable plastic.' },
  DIMSUM: { id: 'DIMSUM', name: 'Har Gow', price: 38, description: 'Crystal shrimp dumplings.', consumable: true },
  ROAST_GOOSE: { id: 'ROAST_GOOSE', name: 'Roast Goose Rice', price: 65, description: 'Tai Hing classic.', consumable: true },
};

export const SHOPS = {
  MCDONALDS: { name: "McDonald's", items: ['CHIPS', 'WATER'] },
  SEVEN_ELEVEN: { name: "7-Eleven", items: ['WATER', 'CHIPS', 'COFFEE', 'LEGO'] },
  YAMAZAKI_BAKERY: { name: "Yamazaki Bakery", items: ['DONUT'] },
  MANNINGS: { name: "Mannings", items: ['MEDICINE'] },
  DIM_SUM_PALACE: { name: "Dim Sum Palace", items: ['DIMSUM'] },
  TAI_HING: { name: "Tai Hing", items: ['ROAST_GOOSE'] },
};

export const WORLD_OBJECTS: GameObject[] = [
  // G/F - Ground Floor
  { id: 'mcd', type: 'SHOP', x: 0, y: 0, width: 200, height: 200, name: "McDonald's", floor: Floor.GF, spriteKey: 'shop_mcd_detailed', interactRange: 160 },
  { id: 'toilets_gf', type: 'OBJECT', x: 600, y: 0, width: 200, height: 200, name: 'Toilets', floor: Floor.GF, spriteKey: 'toilets_detailed', interactRange: 160 },
  { id: 'elev_gf', type: 'TRANSITION', x: 280, y: 0, width: 100, height: 120, name: 'Elevator', floor: Floor.GF, spriteKey: 'elevator_detailed', data: { toFloor: Floor.F2 }, interactRange: 80 },
  { id: 'info_desk', type: 'INFO_DESK', x: 420, y: 0, width: 140, height: 100, name: 'Info Desk', floor: Floor.GF, spriteKey: 'info_desk_detailed', interactRange: 100 },
  
  { id: 'exit_mtr', type: 'TRANSITION', x: 0, y: 260, width: 60, height: 80, name: 'MTR Station', floor: Floor.GF, spriteKey: 'mtr_detailed', data: { cost: 12, method: 'Octopus' }, interactRange: 60 },
  { id: 'esc_gf_up', type: 'TRANSITION', x: 340, y: 260, width: 60, height: 80, name: 'Escalator Up', floor: Floor.GF, spriteKey: 'esc_up_detailed', data: { toFloor: Floor.F1 }, interactRange: 60 },
  { id: 'esc_gf_down', type: 'OBJECT', x: 410, y: 260, width: 60, height: 80, name: 'Escalator Down', floor: Floor.GF, spriteKey: 'esc_down_detailed', interactRange: 60 },
  { id: 'exit_bus', type: 'TRANSITION', x: 740, y: 260, width: 60, height: 80, name: 'Bus Station', floor: Floor.GF, spriteKey: 'bus_detailed', data: { cost: 6, method: 'Octopus' }, interactRange: 60 },
  
  { id: 'yamazaki_bakery', type: 'SHOP', x: 0, y: 400, width: 200, height: 200, name: "Yamazaki Bakery", floor: Floor.GF, spriteKey: 'shop_bakery_detailed', interactRange: 160 },
  { id: '711', type: 'SHOP', x: 600, y: 400, width: 200, height: 200, name: "7-Eleven", floor: Floor.GF, spriteKey: 'shop_711_detailed', interactRange: 160 },
  { id: 'exit_main', type: 'TRANSITION', x: 360, y: 530, width: 80, height: 60, name: 'Main Entrance', floor: Floor.GF, spriteKey: 'exit_detailed', data: { cost: 0, method: 'Free' }, interactRange: 60 },
  { id: 'hsbc_atm', type: 'ATM', x: 500, y: 500, width: 80, height: 100, name: 'HSBC ATM', floor: Floor.GF, spriteKey: 'atm_detailed', interactRange: 80 },
  
  // Decorations G/F
  { id: 'bin_gf_1', type: 'BIN', x: 295, y: 280, width: 40, height: 40, name: 'Bin', floor: Floor.GF, spriteKey: 'bin_detailed', interactRange: 50 },
  { id: 'bin_gf_2', type: 'BIN', x: 475, y: 280, width: 40, height: 40, name: 'Bin', floor: Floor.GF, spriteKey: 'bin_detailed', interactRange: 50 },
  { id: 'plant_gf_1', type: 'OBJECT', x: 310, y: 540, width: 40, height: 60, name: 'Plant', floor: Floor.GF, spriteKey: 'plant_detailed', interactRange: 0 },
  { id: 'plant_gf_2', type: 'OBJECT', x: 450, y: 540, width: 40, height: 60, name: 'Plant', floor: Floor.GF, spriteKey: 'plant_detailed', interactRange: 0 },
  { id: 'bench_gf_1', type: 'OBJECT', x: 215, y: 540, width: 80, height: 40, name: 'Bench', floor: Floor.GF, spriteKey: 'bench_detailed', interactRange: 0 },

  // 1/F - Retail
  { id: 'mannings', type: 'SHOP', x: 0, y: 0, width: 200, height: 160, name: "Mannings", floor: Floor.F1, spriteKey: 'shop_teal', interactRange: 120 },
  { id: 'guard_1f', type: 'NPC', x: 220, y: 100, width: 48, height: 64, name: 'Guard', floor: Floor.F1, spriteKey: 'guard', interactRange: 60 },
  { id: 'esc_1f_up', x: 340, y: 260, width: 60, height: 80, name: 'Escalator Up', floor: Floor.F1, type: 'TRANSITION', spriteKey: 'esc_up_detailed', data: { toFloor: Floor.F2 }, interactRange: 60 },
  { id: 'esc_1f_down', x: 410, y: 260, width: 60, height: 80, name: 'Escalator Down', floor: Floor.F1, type: 'TRANSITION', spriteKey: 'esc_down_detailed', data: { toFloor: Floor.GF }, interactRange: 60 },
  
  // Decorations 1/F
  { id: 'bin_1f_1', type: 'BIN', x: 200, y: 500, width: 40, height: 40, name: 'Bin', floor: Floor.F1, spriteKey: 'bin_detailed', interactRange: 50 },
  { id: 'plant_1f_1', type: 'OBJECT', x: 220, y: 20, width: 40, height: 60, name: 'Plant', floor: Floor.F1, spriteKey: 'plant_detailed', interactRange: 0 },
  { id: 'bench_1f_1', type: 'OBJECT', x: 100, y: 300, width: 80, height: 40, name: 'Bench', floor: Floor.F1, spriteKey: 'bench_detailed', interactRange: 0 },

  // 2/F - Food Court
  { id: 'dim_sum', type: 'SHOP', x: 0, y: 0, width: 200, height: 160, name: "Dim Sum Palace", floor: Floor.F2, spriteKey: 'shop_red', interactRange: 120 },
  { id: 'tai_hing', type: 'SHOP', x: 600, y: 0, width: 200, height: 160, name: "Tai Hing", floor: Floor.F2, spriteKey: 'shop_brown', interactRange: 120 },
  { id: 'elev_2f', type: 'TRANSITION', x: 280, y: 0, width: 100, height: 120, name: 'Elevator', floor: Floor.F2, spriteKey: 'elevator_detailed', data: { toFloor: Floor.GF }, interactRange: 80 },
  { id: 'timothy', type: 'NPC', x: 500, y: 100, width: 48, height: 64, name: 'Mr. Timothy', floor: Floor.F2, spriteKey: 'timothy', interactRange: 60 },
  { id: 'esc_2f_up', x: 340, y: 260, width: 60, height: 80, name: 'Escalator Up', floor: Floor.F2, type: 'OBJECT', spriteKey: 'esc_up_detailed', interactRange: 60 },
  { id: 'esc_2f_down', x: 410, y: 260, width: 60, height: 80, name: 'Escalator Down', floor: Floor.F2, type: 'TRANSITION', spriteKey: 'esc_down_detailed', data: { toFloor: Floor.F1 }, interactRange: 60 },
  
  // Decorations 2/F
  { id: 'bin_2f_1', type: 'BIN', x: 400, y: 500, width: 40, height: 40, name: 'Bin', floor: Floor.F2, spriteKey: 'bin_detailed', interactRange: 50 },
  { id: 'bench_2f_1', type: 'OBJECT', x: 100, y: 180, width: 80, height: 40, name: 'Bench', floor: Floor.F2, spriteKey: 'bench_detailed', interactRange: 0 },
  { id: 'bench_2f_2', type: 'OBJECT', x: 620, y: 180, width: 80, height: 40, name: 'Bench', floor: Floor.F2, spriteKey: 'bench_detailed', interactRange: 0 },
  { id: 'plant_2f_1', type: 'OBJECT', x: 300, y: 450, width: 40, height: 60, name: 'Plant', floor: Floor.F2, spriteKey: 'plant_detailed', interactRange: 0 },
];
