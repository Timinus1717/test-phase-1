export class SpriteService {
  private static canvases: Record<string, HTMLCanvasElement> = {};

  static generateSprites() {
    // Player Sprites: Key, Shirt, Bottoms, Hair, isGirl, isGuard, isTimothy
    this.createHumanoid('boy', '#FFFFFF', '#2E7D32', '#000000', false);
    this.createHumanoid('girl', '#FFFFFF', '#2E7D32', '#000000', true);
    this.createHumanoid('guard', '#1A237E', '#1A237E', '#000000', false, true);
    this.createHumanoid('timothy', '#FFFFFF', '#455A64', '#FFFFFF', false, false, true);
    
    // Detailed World Object Sprites
    this.createDetailedElevator();
    this.createDetailedInfoDesk();
    this.createDetailedA1Bakery();
    this.createDetailedAtm();
    this.createDetailedToilets();
    this.createDetailedSevenEleven();
    this.createDetailedMcd();
    this.createDetailedMainEntrance();
    this.createDetailedBusStation();
    this.createDetailedMtrStation();
    
    // Escalators
    this.createDetailedEscalator(true);  // Up
    this.createDetailedEscalator(false); // Down
    
    // Decorations
    this.createDetailedBin();
    this.createDetailedPlant();
    this.createDetailedBench();
    
    // Generic Shop Sprites
    this.createBox('shop_teal', '#00796B', '+');
    this.createBox('shop_brown', '#5D4037', 'B');
    this.createBox('shop_blue', '#1976D2', 'T');
    this.createBox('shop_red', '#C62828', 'D');
  }

  private static createHumanoid(key: string, shirt: string, bottoms: string, hair: string, isGirl: boolean, isGuard = false, isTimothy = false) {
    const canvas = document.createElement('canvas');
    // Frame size: 48x64. Sprite sheet is 4 frames x 48 (width) by 4 directions x 64 (height)
    canvas.width = 192; canvas.height = 256; 
    const ctx = canvas.getContext('2d')!;
    const skin = isTimothy ? '#D7CCC8' : '#FFDBAC';
    
    // Body dimensions (slimmer)
    const shirtW = 18;
    const bodyW = 16;
    const headSize = 16;
    
    for (let dir = 0; dir < 4; dir++) {
      for (let frame = 0; frame < 4; frame++) {
        const x = frame * 48 + 24;
        const y = dir * 64 + 12;
        
        // Smoother, natural bobbing logic
        // frame 0: neutral, 1: left step, 2: neutral, 3: right step
        const bob = (frame === 1 || frame === 3) ? 1 : 0;
        const armSwing = (frame === 1) ? 2 : (frame === 3) ? -2 : 0;

        // Shoes
        ctx.fillStyle = isTimothy ? '#3E2723' : '#111';
        ctx.fillRect(x - 7, y + 46 + bob, 6, 4);
        ctx.fillRect(x + 1, y + 46 + bob, 6, 4);

        // White Socks
        if (!isGuard && !isTimothy) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x - 6, y + 40 + bob, 4, 6);
          ctx.fillRect(x + 2, y + 40 + bob, 4, 6);
        }

        if (isGirl) {
          // Skin legs
          ctx.fillStyle = skin;
          ctx.fillRect(x - 6, y + 36 + bob, 4, 4);
          ctx.fillRect(x + 2, y + 36 + bob, 4, 4);
          // Skirt (slimmer)
          ctx.fillStyle = bottoms;
          ctx.fillRect(x - 9, y + 26 + bob, 18, 10);
          // Skirt Stripe
          ctx.fillStyle = '#A5D6A7';
          ctx.fillRect(x - 9, y + 33 + bob, 18, 2);
        } else {
          // Pants/Shorts
          ctx.fillStyle = bottoms;
          if (key === 'boy') {
             // Shorts
             ctx.fillRect(x - 7, y + 28 + bob, 6, 10);
             ctx.fillRect(x + 1, y + 28 + bob, 6, 10);
             // Skin for legs below shorts
             ctx.fillStyle = skin;
             ctx.fillRect(x - 6, y + 38 + bob, 4, 2);
             ctx.fillRect(x + 2, y + 38 + bob, 4, 2);
          } else {
             // Full pants
             ctx.fillRect(x - 7, y + 28 + bob, 6, 18);
             ctx.fillRect(x + 1, y + 28 + bob, 6, 18);
          }
        }

        // Shirt (slimmer 18px vs 24px)
        ctx.fillStyle = shirt;
        ctx.fillRect(x - 9, y + 16 + bob, 18, 18);
        
        // Shirt Detail
        if (key === 'boy') {
          ctx.fillStyle = '#2E7D32';
          ctx.fillRect(x - 1, y + 16 + bob, 2, 18);
          ctx.fillRect(x + 3, y + 20 + bob, 2, 2);
        } else if (isGirl) {
          ctx.fillStyle = '#A5D6A7';
          ctx.fillRect(x - 5, y + 16 + bob, 10, 4); // Collar
          ctx.fillRect(x - 1, y + 18 + bob, 2, 4); // Bow knot
          ctx.fillRect(x - 3, y + 20 + bob, 2, 2); // Bow tails
          ctx.fillRect(x + 1, y + 20 + bob, 2, 2);
          ctx.fillStyle = '#2E7D32';
          ctx.fillRect(x + 3, y + 22 + bob, 2, 2);
        } else if (!isGuard && !isTimothy) {
          ctx.fillStyle = 'rgba(0,0,0,0.1)';
          ctx.fillRect(x - 1, y + 18 + bob, 2, 14);
        }

        // Arms (closer to body)
        ctx.fillStyle = skin;
        ctx.fillRect(x - 12, y + 18 + bob + armSwing, 3, 10);
        ctx.fillRect(x + 9, y + 18 + bob - armSwing, 3, 10);

        // Head (proportional)
        ctx.fillStyle = skin;
        ctx.fillRect(x - 8, y, 16, 16);

        // Hair / Hat
        ctx.fillStyle = hair;
        if (isGuard) {
          ctx.fillRect(x - 10, y - 2, 20, 5); // Hat peak
          ctx.fillRect(x - 8, y - 5, 16, 5); // Hat body
        } else {
          if (key === 'boy') {
            // Smooth hair
            ctx.fillRect(x - 9, y - 2, 18, 6);
            ctx.fillRect(x - 9, y - 1, 2, 6);
            ctx.fillRect(x + 7, y - 1, 2, 6);
          } else if (isGirl) {
            ctx.fillRect(x - 9, y - 2, 18, 9); // Main hair
            // Bows
            ctx.fillStyle = '#616161';
            ctx.fillRect(x - 12, y + 2, 5, 5);
            ctx.fillRect(x + 7, y + 2, 5, 5);
            // Pigtails
            ctx.fillStyle = hair;
            ctx.fillRect(x - 11, y + 5, 3, 8);
            ctx.fillRect(x + 8, y + 5, 3, 8);
          } else {
            ctx.fillRect(x - 9, y - 2, 18, 6); 
          }
        }

        // Eyes
        if (frame === 0 || frame === 2) {
           ctx.fillStyle = '#000';
           ctx.fillRect(x - 4, y + 6, 2, 2);
           ctx.fillRect(x + 2, y + 6, 2, 2);
        }
      }
    }
    this.canvases[key] = canvas;
  }

  private static createDetailedBin() {
    const canvas = document.createElement('canvas');
    canvas.width = 40; canvas.height = 40;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#9E9E9E'; ctx.fillRect(10, 10, 20, 25);
    ctx.fillStyle = '#BDBDBD'; ctx.fillRect(10, 10, 6, 25);
    ctx.fillStyle = '#212121'; ctx.fillRect(10, 10, 20, 4);
    ctx.fillStyle = '#4CAF50'; ctx.beginPath(); ctx.moveTo(16, 20); ctx.lineTo(24, 20); ctx.lineTo(20, 26); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#424242'; ctx.lineWidth = 1; ctx.strokeRect(10, 10, 20, 25);
    this.canvases['bin_detailed'] = canvas;
  }

  private static createDetailedPlant() {
    const canvas = document.createElement('canvas');
    canvas.width = 40; canvas.height = 60;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#A1887F'; ctx.fillRect(10, 40, 20, 15);
    ctx.fillStyle = '#8D6E63'; ctx.fillRect(10, 40, 4, 15);
    ctx.strokeStyle = '#3E2723'; ctx.strokeRect(10, 40, 20, 15);
    ctx.fillStyle = '#1B5E20';
    ctx.beginPath(); ctx.arc(20, 30, 12, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(14, 20, 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(26, 20, 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(20, 12, 10, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath(); ctx.arc(22, 28, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(16, 18, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(22, 10, 4, 0, Math.PI*2); ctx.fill();
    this.canvases['plant_detailed'] = canvas;
  }

  private static createDetailedBench() {
    const canvas = document.createElement('canvas');
    canvas.width = 80; canvas.height = 40;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#212121'; ctx.fillRect(10, 20, 4, 15); ctx.fillRect(66, 20, 4, 15);
    ctx.fillStyle = '#795548';
    for(let i=0; i<4; i++) {
        ctx.fillRect(5, 10 + i*6, 70, 4);
        ctx.strokeStyle = '#3E2723'; ctx.lineWidth = 1; ctx.strokeRect(5, 10 + i*6, 70, 4);
    }
    ctx.fillStyle = '#212121'; ctx.fillRect(5, 10, 4, 14); ctx.fillRect(71, 10, 4, 14);
    this.canvases['bench_detailed'] = canvas;
  }

  private static createDetailedEscalator(isUp: boolean) {
    const canvas = document.createElement('canvas');
    canvas.width = 60; canvas.height = 80;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#78909C'; ctx.fillRect(0, 0, 60, 80);
    ctx.fillStyle = '#CFD8DC'; ctx.fillRect(5, 5, 50, 70);
    ctx.fillStyle = 'rgba(129, 212, 250, 0.4)';
    ctx.fillRect(5, 5, 10, 70); ctx.fillRect(45, 5, 10, 70);
    ctx.fillStyle = '#455A64'; ctx.fillRect(15, 10, 30, 60);
    ctx.strokeStyle = '#263238'; ctx.lineWidth = 1;
    for(let i=0; i<12; i++) {
      const y = 10 + i*5;
      ctx.beginPath();
      if(isUp) { ctx.moveTo(15, y + 5); ctx.lineTo(45, y); } 
      else { ctx.moveTo(15, y); ctx.lineTo(45, y + 5); }
      ctx.stroke();
    }
    ctx.fillStyle = '#000';
    ctx.fillRect(5, 5, 10, 5); ctx.fillRect(5, 70, 10, 5);
    ctx.fillRect(45, 5, 10, 5); ctx.fillRect(45, 70, 10, 5);
    ctx.fillRect(8, 5, 4, 70); ctx.fillRect(48, 5, 4, 70);
    ctx.fillStyle = isUp ? '#4CAF50' : '#F44336';
    ctx.beginPath(); ctx.arc(30, 72, 3, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#FFF'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
    ctx.fillText(isUp ? '▲' : '▼', 30, 65);
    this.canvases[isUp ? 'esc_up_detailed' : 'esc_down_detailed'] = canvas;
  }

  private static createDetailedMainEntrance() {
    const canvas = document.createElement('canvas');
    canvas.width = 80; canvas.height = 60;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#455A64'; ctx.fillRect(0, 0, 80, 60);
    ctx.fillStyle = '#CFD8DC'; ctx.fillRect(5, 5, 70, 55);
    ctx.fillStyle = '#90CAF9'; ctx.fillRect(10, 10, 28, 50);
    ctx.fillRect(42, 10, 28, 50);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(25, 10); ctx.lineTo(10, 30); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(42, 10); ctx.lineTo(57, 10); ctx.lineTo(42, 30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1B5E20'; ctx.fillRect(25, 2, 30, 8);
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 5px monospace'; ctx.textAlign = 'center';
    ctx.fillText('EXIT', 40, 8);
    this.canvases['exit_detailed'] = canvas;
  }

  private static createDetailedBusStation() {
    const canvas = document.createElement('canvas');
    canvas.width = 60; canvas.height = 80;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFC107'; ctx.fillRect(25, 0, 10, 80);
    ctx.fillStyle = '#D32F2F'; ctx.beginPath(); ctx.arc(30, 20, 18, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#FFF'; ctx.fillRect(22, 16, 16, 10);
    ctx.fillStyle = '#111'; ctx.fillRect(24, 23, 4, 4); ctx.fillRect(32, 23, 4, 4);
    ctx.fillStyle = '#111'; ctx.fillRect(15, 45, 30, 15);
    ctx.fillStyle = '#FFEB3B'; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
    ctx.fillText('968X', 30, 55);
    this.canvases['bus_detailed'] = canvas;
  }

  private static createDetailedMtrStation() {
    const canvas = document.createElement('canvas');
    canvas.width = 60; canvas.height = 80;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#B71C1C'; ctx.fillRect(0, 0, 60, 80);
    ctx.strokeStyle = '#880E4F'; ctx.lineWidth = 1;
    for(let i=0; i<10; i++) ctx.strokeRect(0, i*8, 60, 8);
    for(let j=0; j<6; j++) ctx.strokeRect(j*10, 0, 10, 80);
    ctx.strokeStyle = '#FFF'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(20, 15); ctx.lineTo(40, 35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, 15); ctx.lineTo(20, 35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, 25); ctx.lineTo(40, 25); ctx.stroke();
    ctx.fillStyle = '#000'; ctx.fillRect(5, 45, 50, 12);
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 6px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('STATION', 30, 54);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(10, 65, 40, 5);
    ctx.fillRect(15, 72, 30, 5);
    this.canvases['mtr_detailed'] = canvas;
  }

  private static createDetailedElevator() {
    const canvas = document.createElement('canvas');
    canvas.width = 100; canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#B0BEC5'; ctx.fillRect(10, 10, 80, 80);
    ctx.strokeStyle = '#455A64'; ctx.lineWidth = 2; ctx.strokeRect(10, 10, 80, 80);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath(); ctx.moveTo(10, 40); ctx.lineTo(40, 10); ctx.lineTo(60, 10); ctx.lineTo(10, 60); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#263238'; ctx.fillRect(20, 25, 60, 65);
    ctx.fillStyle = '#CFD8DC'; ctx.fillRect(22, 27, 56, 63);
    ctx.strokeStyle = '#455A64'; ctx.lineWidth = 1;
    for(let i=1; i<4; i++) { ctx.beginPath(); ctx.moveTo(22 + i*14, 27); ctx.lineTo(22 + i*14, 90); ctx.stroke(); }
    ctx.fillStyle = '#111'; ctx.fillRect(38, 14, 24, 8);
    ctx.fillStyle = '#D32F2F'; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
    ctx.fillText('1', 50, 21);
    ctx.fillStyle = '#4CAF50'; ctx.fillRect(82, 50, 6, 6);
    ctx.fillStyle = '#D32F2F'; ctx.fillRect(82, 58, 6, 6);
    this.canvases['elevator_detailed'] = canvas;
  }

  private static createDetailedInfoDesk() {
    const canvas = document.createElement('canvas');
    canvas.width = 140; canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFDBAC'; ctx.fillRect(62, 20, 16, 16);
    ctx.fillStyle = '#3E2723'; ctx.fillRect(62, 20, 16, 4);
    ctx.fillStyle = '#FFF'; ctx.fillRect(60, 36, 20, 14);
    ctx.fillStyle = '#795548'; ctx.fillRect(20, 70, 100, 25);
    ctx.strokeStyle = '#3E2723';
    for(let i=0; i<10; i++) ctx.strokeRect(20 + i*10, 70, 10, 25);
    ctx.fillStyle = '#A1887F'; ctx.fillRect(15, 50, 110, 20);
    ctx.strokeRect(15, 50, 110, 20);
    ctx.fillStyle = '#D7CCC8'; ctx.fillRect(20, 53, 70, 14);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath(); ctx.moveTo(25, 53); ctx.lineTo(40, 53); ctx.lineTo(25, 67); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#424242'; ctx.fillRect(25, 45, 14, 10);
    ctx.fillStyle = '#424242'; ctx.fillRect(45, 55, 20, 4);
    ctx.fillStyle = '#FFF'; ctx.fillRect(95, 53, 14, 14);
    ctx.strokeStyle = '#000'; ctx.strokeRect(95, 53, 14, 14);
    ctx.fillStyle = '#000'; ctx.font = 'bold 10px serif'; ctx.textAlign = 'center';
    ctx.fillText('i', 102, 64);
    this.canvases['info_desk_detailed'] = canvas;
  }

  private static createDetailedA1Bakery() {
    const canvas = document.createElement('canvas');
    canvas.width = 160; canvas.height = 160;
    const ctx = canvas.getContext('2d')!;
    for(let r=0; r<10; r++) for(let c=0; c<10; c++) {
      ctx.fillStyle = (r+c)%2===0 ? '#FFE0B2' : '#BCAAA4';
      ctx.fillRect(c*16, r*16, 16, 16);
    }
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(5, 5, 150, 35); ctx.fillRect(5, 5, 30, 130); 
    ctx.strokeStyle = '#3E2723';
    for(let i=0; i<6; i++) ctx.strokeRect(35 + i*20, 5, 20, 35);
    for(let i=0; i<5; i++) ctx.strokeRect(5, 35 + i*20, 30, 20);
    ctx.fillStyle = '#FFDBAC'; ctx.fillRect(72, 50, 16, 16);
    ctx.fillStyle = '#FFF'; ctx.fillRect(70, 40, 20, 12); ctx.fillRect(70, 66, 20, 15); 
    ctx.fillStyle = '#4E342E'; ctx.fillRect(45, 85, 75, 25);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; ctx.fillRect(45, 85, 75, 12);
    ctx.fillStyle = '#FFB74D';
    for(let i=0; i<4; i++) ctx.beginPath(), ctx.arc(55 + i*18, 97, 4, 0, Math.PI*2), ctx.fill();
    ctx.fillStyle = '#8D6E63'; ctx.fillRect(50, 120, 80, 25);
    ctx.strokeStyle = '#3E2723'; ctx.strokeRect(50, 120, 80, 25);
    ctx.fillStyle = '#D2691E'; 
    for(let i=0; i<5; i++) ctx.fillRect(55+i*15, 125, 10, 15); 
    ctx.fillStyle = '#B71C1C'; ctx.fillRect(120, 40, 35, 45);
    ctx.strokeStyle = '#111';
    for(let i=0; i<5; i++) { ctx.beginPath(); ctx.moveTo(120, 40+i*9); ctx.lineTo(155, 40+i*9); ctx.stroke(); }
    ctx.fillStyle = '#B71C1C'; ctx.fillRect(10, 140, 20, 15); ctx.fillRect(130, 140, 20, 15); 
    ctx.fillStyle = '#FFF'; for(let i=0; i<4; i++) ctx.fillRect(12+i*4, 142, 2, 2);
    this.canvases['shop_bakery_detailed'] = canvas;
  }

  private static createDetailedAtm() {
    const canvas = document.createElement('canvas');
    canvas.width = 80; canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#90A4AE'; ctx.fillRect(5, 5, 70, 90);
    ctx.strokeStyle = '#37474F'; ctx.lineWidth = 2; ctx.strokeRect(5, 5, 70, 90);
    ctx.fillStyle = '#D32F2F'; ctx.fillRect(5, 5, 70, 18);
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
    ctx.fillText('++ HSBC', 40, 17);
    ctx.fillStyle = '#263238'; ctx.fillRect(15, 28, 50, 30);
    ctx.strokeStyle = '#455A64'; ctx.strokeRect(15, 28, 50, 30);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath(); ctx.moveTo(15, 28); ctx.lineTo(35, 28); ctx.lineTo(15, 58); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#CFD8DC'; ctx.fillRect(15, 65, 25, 18);
    ctx.fillStyle = '#78909C';
    for(let r=0; r<3; r++) for(let c=0; c<3; c++) ctx.fillRect(17+c*8, 67+r*5, 5, 3);
    ctx.fillStyle = '#212121'; ctx.fillRect(50, 68, 15, 5);
    ctx.fillStyle = '#4CAF50'; ctx.fillRect(62, 70, 4, 1);
    this.canvases['atm_detailed'] = canvas;
  }

  private static createDetailedToilets() {
    const canvas = document.createElement('canvas');
    canvas.width = 160; canvas.height = 160;
    const ctx = canvas.getContext('2d')!;
    for(let r=0; r<10; r++) for(let c=0; c<10; c++) {
      ctx.fillStyle = (r+c)%2===0 ? '#FFE0B2' : '#BCAAA4';
      ctx.fillRect(c*16, r*16, 16, 16);
    }
    ctx.fillStyle = '#283593'; ctx.fillRect(20, 20, 45, 80);
    ctx.strokeStyle = '#1A237E'; ctx.strokeRect(20, 20, 45, 80);
    ctx.fillStyle = '#FFF'; ctx.fillRect(35, 30, 15, 12);
    ctx.fillStyle = '#283593'; ctx.font = 'bold 8px Arial'; ctx.fillText('M', 42, 39);
    ctx.fillStyle = '#C62828'; ctx.fillRect(95, 20, 45, 80);
    ctx.strokeStyle = '#B71C1C'; ctx.strokeRect(95, 20, 45, 80);
    ctx.fillStyle = '#FFF'; ctx.fillRect(110, 30, 15, 12);
    ctx.fillStyle = '#C62828'; ctx.fillText('W', 117, 39);
    ctx.fillStyle = '#B0BEC5'; ctx.fillRect(70, 70, 20, 15);
    ctx.fillStyle = '#CFD8DC'; ctx.fillRect(72, 72, 16, 8);
    this.canvases['toilets_detailed'] = canvas;
  }

  private static createDetailedSevenEleven() {
    const canvas = document.createElement('canvas');
    canvas.width = 160; canvas.height = 160;
    const ctx = canvas.getContext('2d')!;
    for(let r=0; r<10; r++) for(let c=0; c<10; c++) {
      ctx.fillStyle = (r+c)%2===0 ? '#FFE0B2' : '#BCAAA4';
      ctx.fillRect(c*16, r*16, 16, 16);
    }
    ctx.fillStyle = '#EF6C00'; ctx.fillRect(0, 0, 160, 6);
    ctx.fillStyle = '#D32F2F'; ctx.fillRect(0, 6, 160, 6);
    ctx.fillStyle = '#388E3C'; ctx.fillRect(0, 12, 160, 6);
    ctx.fillStyle = '#5D4037';
    for(let i=0; i<3; i++) {
        ctx.fillRect(20 + i*40, 70, 12, 60);
        for(let j=0; j<4; j++) {
            ctx.fillStyle = ['#F44336', '#2196F3', '#FFEB3B', '#4CAF50'][j%4];
            ctx.fillRect(22+i*40, 75+j*12, 8, 8);
        }
    }
    ctx.fillStyle = '#FFF'; ctx.fillRect(90, 40, 60, 20);
    ctx.fillStyle = '#D32F2F'; ctx.fillRect(90, 60, 60, 5);
    ctx.fillStyle = '#FFDBAC'; ctx.fillRect(110, 25, 16, 16);
    ctx.fillStyle = '#388E3C'; ctx.fillRect(108, 41, 20, 10);
    this.canvases['shop_711_detailed'] = canvas;
  }

  private static createDetailedMcd() {
    const canvas = document.createElement('canvas');
    canvas.width = 160; canvas.height = 160;
    const ctx = canvas.getContext('2d')!;
    for(let r=0; r<10; r++) for(let c=0; c<10; c++) {
      ctx.fillStyle = (r+c)%2===0 ? '#FFF' : '#D32F2F';
      ctx.fillRect(c*16, r*16, 16, 16);
    }
    ctx.fillStyle = '#B71C1C'; ctx.fillRect(50, 5, 60, 40);
    ctx.fillStyle = '#FFD600'; ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center';
    ctx.fillText('M', 80, 36);
    ctx.fillStyle = '#FFF'; ctx.fillRect(40, 60, 80, 30);
    ctx.strokeStyle = '#B71C1C'; ctx.lineWidth = 2; ctx.strokeRect(40, 60, 80, 30);
    ctx.fillStyle = '#FFDBAC'; ctx.fillRect(72, 45, 16, 16);
    ctx.fillStyle = '#FFF'; ctx.fillRect(70, 61, 20, 10);
    ctx.fillStyle = '#B71C1C'; ctx.fillRect(5, 50, 15, 80);
    ctx.fillStyle = '#FFD600'; ctx.fillRect(130, 50, 20, 20);
    this.canvases['shop_mcd_detailed'] = canvas;
  }

  private static createBox(key: string, color: string, label: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 160;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color; ctx.fillRect(5, 5, 190, 150);
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 30px monospace'; ctx.textAlign = 'center';
    ctx.fillText(label, 100, 95);
    this.canvases[key] = canvas;
  }

  static getSprite(key: string) {
    return this.canvases[key];
  }
}