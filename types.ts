
export enum GameState {
  START = 'START',
  PLAY = 'PLAY',
  DIALOGUE = 'DIALOGUE',
  SHOP = 'SHOP',
  INVENTORY = 'INVENTORY',
  CHOICE = 'CHOICE',
  GAME_OVER = 'GAME_OVER'
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export enum Floor {
  GF = 'G/F',
  F1 = '1/F',
  F2 = '2/F',
  F3 = '3/F',
  F4 = '4/F',
  F5 = '5/F',
  ROOF = 'ROOF'
}

export interface PlayerState {
  x: number;
  y: number;
  direction: Direction;
  frame: number;
  gender: 'boy' | 'girl';
  cash: number;
  bankBalance: number;
  octopusBalance: number;
  inventory: InventoryItem[];
  floor: Floor;
  score: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  description: string;
  consumable?: boolean;
  leavesTrash?: boolean;
}

export interface GameObject {
  id: string;
  type: 'NPC' | 'OBJECT' | 'SHOP' | 'TRANSITION' | 'BIN' | 'ATM' | 'INFO_DESK';
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  interactRange: number;
  floor: Floor;
  spriteKey: string;
  data?: any;
}

export interface GameQuest {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}
