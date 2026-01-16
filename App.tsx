import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Floor, Direction, PlayerState, InventoryItem, GameObject } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, PLAYER_SPEED, WORLD_OBJECTS, ITEMS, SHOPS } from './constants';
import { SpriteService } from './services/spriteService';
import { getInfoDeskHint } from './services/geminiService';

SpriteService.generateSprites();

const CharacterPreview: React.FC<{ gender: 'boy' | 'girl' }> = ({ gender }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const sprite = SpriteService.getSprite(gender);
    if (!ctx || !sprite) return;

    let animId: number;
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, 96, 128);
      
      // Breathing effect using sine wave for a more natural idle feel
      // Frequency: 0.003 (slow and steady), Amplitude: 3px
      const breathingBob = Math.sin(Date.now() * 0.003) * 3;
      
      // We use Frame 0 (Neutral front-facing) for the idle breathing preview
      ctx.drawImage(
        sprite,
        0, 0, 48, 64,            // Source (Frame 0, Direction DOWN)
        0, breathingBob + 4, 96, 128 // Destination (scaled 2x) + slight offset
      );
      
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [gender]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="border-4 border-white bg-zinc-800 p-2 shadow-2xl relative overflow-hidden">
        <canvas ref={canvasRef} width={96} height={128} className="pixelated" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [player, setPlayer] = useState<PlayerState>({
    x: 380,
    y: 400,
    direction: Direction.DOWN,
    frame: 0,
    gender: 'boy',
    cash: 100,
    bankBalance: 500,
    octopusBalance: 50,
    inventory: [],
    floor: Floor.GF,
    score: 0
  });

  const posRef = useRef({
    x: 380,
    y: 400,
    direction: Direction.DOWN,
    frame: 0,
    floor: Floor.GF,
  });

  const [dialogue, setDialogue] = useState<{ name: string, text: string } | null>(null);
  const [activeShop, setActiveShop] = useState<string | null>(null);
  const [choice, setChoice] = useState<{ title: string, options?: string[], onSelect: (idx: number) => void } | null>(null);
  const [secretCode, setSecretCode] = useState<string[]>(['?', '?', '?', '?']);
  const [atmLocked, setAtmLocked] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysPressed = useRef<Record<string, boolean>>({});

  useEffect(() => {
    posRef.current = {
      x: player.x,
      y: player.y,
      direction: player.direction,
      frame: player.frame,
      floor: player.floor,
    };
  }, [player.floor, player.gender, player.x, player.y, player.direction, player.frame]);

  const handleInteract = useCallback(() => {
    if (gameState !== GameState.PLAY) return;
    const currentPos = posRef.current;
    
    const nearby = WORLD_OBJECTS.filter(o => o.floor === currentPos.floor).find(obj => {
      const playerCenterX = currentPos.x + 24;
      const playerCenterY = currentPos.y + 32;
      const objCenterX = obj.x + obj.width / 2;
      const objCenterY = obj.y + obj.height / 2;
      
      const dist = Math.sqrt(Math.pow(playerCenterX - objCenterX, 2) + Math.pow(playerCenterY - objCenterY, 2));
      return dist < obj.interactRange;
    });

    if (nearby) {
      switch (nearby.type) {
        case 'SHOP': setActiveShop(nearby.id); setGameState(GameState.SHOP); break;
        case 'ATM': handleATM(); break;
        case 'BIN': handleBin(nearby.id); break;
        case 'INFO_DESK': handleInfoDesk(); break;
        case 'NPC': handleNPC(nearby.id); break;
        case 'TRANSITION': handleTransition(nearby); break;
      }
    }
  }, [gameState, player.inventory, player.cash, player.bankBalance, player.octopusBalance]);

  useEffect(() => {
    let frameId: number;
    const ctx = canvasRef.current?.getContext('2d');

    const loop = () => {
      if (gameState === GameState.PLAY) {
        update();
      }
      draw();
      frameId = requestAnimationFrame(loop);
    };

    const update = () => {
      let dx = 0, dy = 0;
      if (keysPressed.current['w'] || keysPressed.current['ArrowUp']) dy -= PLAYER_SPEED;
      if (keysPressed.current['s'] || keysPressed.current['ArrowDown']) dy += PLAYER_SPEED;
      if (keysPressed.current['a'] || keysPressed.current['ArrowLeft']) dx -= PLAYER_SPEED;
      if (keysPressed.current['d'] || keysPressed.current['ArrowRight']) dx += PLAYER_SPEED;

      const current = posRef.current;
      
      if (dx !== 0 || dy !== 0) {
        let nx = current.x + dx;
        let ny = current.y + dy;
        let nd = current.direction;

        if (dy < 0) nd = Direction.UP;
        else if (dy > 0) nd = Direction.DOWN;
        else if (dx < 0) nd = Direction.LEFT;
        else if (dx > 0) nd = Direction.RIGHT;

        nx = Math.max(0, Math.min(CANVAS_WIDTH - 48, nx));
        ny = Math.max(0, Math.min(CANVAS_HEIGHT - 64, ny));

        const floorObjs = WORLD_OBJECTS.filter(o => o.floor === current.floor);
        let collision = false;
        const pBox = { x: nx + 12, y: ny + 44, w: 24, h: 20 };
        
        for (const obj of floorObjs) {
          if (pBox.x < obj.x + obj.width && pBox.x + pBox.w > obj.x && pBox.y < obj.y + obj.height && pBox.y + pBox.h > obj.y) {
            collision = true;
            break;
          }
        }

        if (!collision) {
          current.x = nx;
          current.y = ny;
        }
        current.direction = nd;
        current.frame = (current.frame + 0.12) % 4;

        setPlayer(prev => ({ ...prev, x: current.x, y: current.y, direction: current.direction, frame: current.frame }));
      } else {
        if (current.frame !== 0) {
          current.frame = 0;
          setPlayer(prev => ({ ...prev, frame: 0 }));
        }
      }
    };

    const draw = () => {
      if (!ctx) return;
      const current = posRef.current;

      ctx.fillStyle = '#e5e5e5';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = '#d1d1d1';
      ctx.lineWidth = 1;
      for (let i = 0; i < CANVAS_WIDTH; i += TILE_SIZE) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_HEIGHT); ctx.stroke();
      }
      for (let i = 0; i < CANVAS_HEIGHT; i += TILE_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_WIDTH, i); ctx.stroke();
      }

      WORLD_OBJECTS.filter(o => o.floor === current.floor).forEach(obj => {
        const spr = SpriteService.getSprite(obj.spriteKey);
        if (spr) ctx.drawImage(spr, obj.x, obj.y, obj.width, obj.height);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(obj.name, obj.x + obj.width / 2, obj.y - 10);
      });

      const pSpr = SpriteService.getSprite(player.gender);
      if (pSpr) {
        const di = [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP].indexOf(current.direction);
        const fi = Math.floor(current.frame);
        ctx.drawImage(pSpr, fi * 48, di * 64, 48, 64, current.x, current.y, 48, 64);
      }
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [gameState, player.gender]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      
      if (['e', 'Enter', ' '].includes(e.key)) {
        if (gameState === GameState.DIALOGUE) {
          setGameState(GameState.PLAY);
        } else if (gameState === GameState.PLAY) {
          handleInteract();
        } else if ([GameState.SHOP, GameState.INVENTORY, GameState.CHOICE].includes(gameState)) {
          setGameState(GameState.PLAY);
        }
      }

      if (e.key === 'i') {
        if (gameState === GameState.PLAY) setGameState(GameState.INVENTORY);
        else if (gameState === GameState.INVENTORY) setGameState(GameState.PLAY);
      }
    };
    const up = (e: KeyboardEvent) => keysPressed.current[e.key] = false;
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [handleInteract, gameState]);

  const handleATM = () => {
    if (atmLocked) {
      setDialogue({ name: 'ATM', text: 'Enter 4-digit PIN. (Hint: Try 0000 or search bins)' });
      setChoice({
        title: 'Enter PIN?',
        options: ['0000', 'Cancel'],
        onSelect: (idx) => {
           if (idx === 0) { 
             setAtmLocked(false); 
             setDialogue({ name: 'ATM', text: 'Access Granted. Welcome valued customer.' }); 
             setGameState(GameState.DIALOGUE);
           } else {
             setGameState(GameState.PLAY);
           }
        }
      });
      setGameState(GameState.CHOICE);
    } else {
      setChoice({
        title: `Bank Balance: $${player.bankBalance}. Select Action:`,
        options: ['Withdraw $100', 'Deposit All Cash', 'Close'],
        onSelect: (idx) => {
          if (idx === 0) {
            if (player.bankBalance >= 100) {
              setPlayer(p => ({ ...p, bankBalance: p.bankBalance - 100, cash: p.cash + 100 }));
              setDialogue({ name: 'ATM', text: 'Transaction Successful. Withdrew $100.' });
            } else {
              setDialogue({ name: 'ATM', text: 'Insufficient Bank Balance.' });
            }
          } else if (idx === 1) {
            setPlayer(p => ({ ...p, bankBalance: p.bankBalance + p.cash, cash: 0 }));
            setDialogue({ name: 'ATM', text: 'Transaction Successful. Deposited all cash.' });
          } else {
            setGameState(GameState.PLAY);
            return;
          }
          setGameState(GameState.DIALOGUE);
        }
      });
      setGameState(GameState.CHOICE);
    }
  };

  const handleBin = (id: string) => {
    const mapping: Record<string, { d: string, p: number }> = { 
      'bin_gf_1': { d: '0', p: 0 }, 
      'bin_1f_1': { d: '0', p: 1 }, 
      'bin_2f_1': { d: '0', p: 2 } 
    };
    const secret = mapping[id];
    let msg = 'Just some old newspapers and a half-eaten sandwich.';
    if (secret) {
      setSecretCode(prev => { const n = [...prev]; n[secret.p] = secret.d; return n; });
      msg = `You found a secret digit: ${secret.d} at Position ${secret.p + 1}!`;
    }

    const hasTrash = player.inventory.some(i => i.id === 'TRASH' || i.id === 'BOTTLE');
    if (hasTrash) {
      setPlayer(p => ({ 
        ...p, 
        inventory: p.inventory.filter(i => i.id !== 'TRASH' && i.id !== 'BOTTLE'), 
        score: p.score + 50 
      }));
      msg += "\n\nYou disposed of your trash. Score +50!";
    }

    setDialogue({ name: 'Bin', text: msg });
    setGameState(GameState.DIALOGUE);
  };

  const handleNPC = (id: string) => {
    if (id.startsWith('guard')) {
      setDialogue({ name: 'Guard', text: 'Keep the mall clean, kid. Loitering is not permitted.' });
    } else if (id === 'timothy') {
      const ids = player.inventory.map(i => i.id);
      if (ids.includes('COFFEE') && ids.includes('DONUT') && ids.includes('LEGO')) {
        setPlayer(p => ({ 
          ...p, 
          inventory: p.inventory.filter(i => !['COFFEE', 'DONUT', 'LEGO'].includes(i.id)), 
          score: p.score + 1000 
        }));
        setDialogue({ name: 'Mr. Timothy', text: 'Brilliant! You found everything. My collection is complete! Here\'s a bonus!' });
      } else {
        setDialogue({ name: 'Mr. Timothy', text: 'Hrumph... I need my Morning Coffee, a Chocolate Donut, and that Star Wars Lego set before I talk.' });
      }
    }
    setGameState(GameState.DIALOGUE);
  };

  const handleTransition = (obj: GameObject) => {
    if (obj.data?.toFloor) {
       let newY = obj.y + obj.height + 70;
       if (newY > CANVAS_HEIGHT - 64) newY = obj.y - 100;
       
       setPlayer(p => ({ 
         ...p, 
         floor: obj.data.toFloor, 
         x: obj.x + (obj.width / 2) - 24, 
         y: newY 
       }));
       setDialogue({ name: 'System', text: `Transitioning to ${obj.data.toFloor}...` });
       setGameState(GameState.DIALOGUE);
    } else if (obj.data?.cost !== undefined) {
      setChoice({
        title: `Leave Mall via ${obj.name}? Cost: $${obj.data.cost} (${obj.data.method})`,
        options: ['Confirm', 'Cancel'],
        onSelect: (idx) => {
          if (idx === 0) {
            const cost = obj.data.cost;
            if (obj.data.method === 'Octopus' && player.octopusBalance >= cost) {
              setPlayer(p => ({ ...p, octopusBalance: p.octopusBalance - cost }));
              setGameState(GameState.GAME_OVER);
            } else if (cost === 0) {
              setGameState(GameState.GAME_OVER);
            } else {
              setDialogue({ name: 'System', text: 'Insufficient Octopus Card Balance!' });
              setGameState(GameState.DIALOGUE);
            }
          } else setGameState(GameState.PLAY);
        }
      });
      setGameState(GameState.CHOICE);
    }
  };

  const handleInfoDesk = async () => {
    setDialogue({ name: 'Info Desk', text: 'Asking AI Guide...' });
    setGameState(GameState.DIALOGUE);
    const hint = await getInfoDeskHint(player.floor, player.inventory, player.cash);
    setDialogue({ name: 'Info Desk', text: hint });
  };

  const buy = (id: string) => {
    const item = ITEMS[id];
    if (player.inventory.length >= 10) {
      alert('Your backpack is full!');
      return;
    }
    if (player.cash >= item.price) {
      setPlayer(p => ({ ...p, cash: p.cash - item.price, inventory: [...p.inventory, item] }));
    } else {
      alert('Not enough cash! Visit an ATM.');
    }
  };

  const consume = (idx: number) => {
    const item = player.inventory[idx];
    if (item.consumable) {
      const inv = [...player.inventory];
      inv.splice(idx, 1);
      if (item.leavesTrash) inv.push(item.id === 'WATER' ? ITEMS.BOTTLE : ITEMS.TRASH);
      setPlayer(p => ({ ...p, inventory: inv }));
    }
  };

  const startDir = (dir: string) => { keysPressed.current[dir] = true; };
  const stopDir = (dir: string) => { keysPressed.current[dir] = false; };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-zinc-950 overflow-hidden select-none">
      <div className="w-[800px] h-[660px] flex flex-col border-4 border-zinc-800 shadow-2xl relative bg-black">
        <div className="h-16 bg-black border-b-2 border-white flex items-center justify-between px-6 text-white text-[10px]">
          <div className="flex flex-col gap-1">
            <span className="text-yellow-400 font-bold">{player.floor}</span>
            <span className="text-zinc-400 font-mono tracking-tighter">GOAL: {player.inventory.some(i => i.id === 'MEDICINE') ? 'DELIVER MEDICINE' : 'FIND MEDICINE'}</span>
          </div>
          <div className="flex gap-6">
            <span className="text-emerald-400">CASH:${player.cash}</span>
            <span className="text-blue-400">BANK:${player.bankBalance}</span>
            <span className="text-orange-400">OCT:${player.octopusBalance}</span>
          </div>
          <div className="text-yellow-400">SCORE:{player.score}</div>
        </div>

        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-zinc-200" />

        {gameState === GameState.START && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-white z-50 p-8">
            <h1 className="text-5xl mb-8 text-yellow-500 text-center leading-tight tracking-widest opacity-90 animate-[pulse_3s_infinite] drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">MALL QUEST</h1>
            <p className="mb-12 text-center text-zinc-400 leading-8 text-[10px] max-w-md">
              Grandma is ill. Get Medicine from Mannings (1/F) and deliver it home via the G/F exits.<br/><br/>
              Mr. Timothy (2/F) is looking for snacks and a Lego set.
            </p>
            <div className="flex gap-24 items-end">
              <div className="flex flex-col items-center gap-10">
                <CharacterPreview gender="boy" />
                <button 
                  onClick={() => { setPlayer(p => ({ ...p, gender: 'boy' })); setGameState(GameState.PLAY); }} 
                  className="px-8 py-4 bg-blue-600 border-4 border-white hover:bg-blue-500 transition-all duration-300 active:translate-y-1 text-[10px] w-32 font-bold shadow-[0_5px_0_#1e3a8a] active:shadow-none"
                >
                  Boy
                </button>
              </div>
              <div className="flex flex-col items-center gap-10">
                <CharacterPreview gender="girl" />
                <button 
                  onClick={() => { setPlayer(p => ({ ...p, gender: 'girl' })); setGameState(GameState.PLAY); }} 
                  className="px-8 py-4 bg-pink-600 border-4 border-white hover:bg-pink-500 transition-all duration-300 active:translate-y-1 text-[10px] w-32 font-bold shadow-[0_5px_0_#9d174d] active:shadow-none"
                >
                  Girl
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === GameState.DIALOGUE && dialogue && (
          <div 
            className="absolute inset-0 z-50 flex items-end justify-center pb-12 px-6"
            onClick={() => setGameState(GameState.PLAY)}
          >
            <div className="bg-blue-950 border-4 border-white p-6 text-white w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <div className="absolute -top-6 left-6 bg-yellow-500 px-4 py-1 text-black border-2 border-white text-[10px] font-bold">{dialogue.name}</div>
              <p className="text-[12px] leading-relaxed mb-4 min-h-[40px] whitespace-pre-wrap">{dialogue.text}</p>
              <button onClick={() => setGameState(GameState.PLAY)} className="float-right text-yellow-400 text-[10px] animate-pulse">CONTINUE [SPACE/ENTER]</button>
            </div>
          </div>
        )}

        {gameState === GameState.SHOP && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-8" onClick={() => setGameState(GameState.PLAY)}>
            <div className="bg-zinc-900 border-4 border-white p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl text-yellow-400 mb-8 text-center">{Object.values(SHOPS).find(s => s.name === WORLD_OBJECTS.find(o => o.id === activeShop)?.name)?.name}</h2>
              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
                {Object.values(SHOPS).find(s => s.name === WORLD_OBJECTS.find(o => o.id === activeShop)?.name)?.items.map(id => (
                  <div key={id} className="flex justify-between items-center border-b border-zinc-700 pb-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white font-bold">{ITEMS[id].name}</span>
                      <span className="text-[8px] text-zinc-500">{ITEMS[id].description}</span>
                    </div>
                    <button onClick={() => buy(id)} className="bg-emerald-600 px-4 py-2 text-[10px] text-white border-2 border-emerald-400 hover:bg-emerald-500 active:bg-emerald-700">BUY ${ITEMS[id].price}</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setGameState(GameState.PLAY)} className="w-full bg-red-600 py-3 text-white border-b-4 border-red-900 active:border-b-0 active:translate-y-1 text-[10px]">EXIT SHOP</button>
            </div>
          </div>
        )}

        {gameState === GameState.INVENTORY && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-8" onClick={() => setGameState(GameState.PLAY)}>
             <div className="bg-zinc-800 border-4 border-white p-8 w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl text-yellow-400">BACKPACK</h2>
                  <span className="text-zinc-400 text-[10px]">{player.inventory.length} / 10 ITEMS</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8 max-h-[350px] overflow-y-auto pr-2">
                  {player.inventory.length === 0 ? (
                    <div className="col-span-2 text-center text-zinc-500 py-8 text-[10px]">YOUR BACKPACK IS EMPTY...</div>
                  ) : player.inventory.map((item, idx) => (
                    <div key={idx} className="bg-zinc-700 p-4 border border-zinc-600 flex justify-between items-center group">
                      <div className="flex flex-col">
                        <div className="text-[10px] text-white font-bold">{item.name}</div>
                        <div className="text-[8px] text-zinc-400">{item.description}</div>
                      </div>
                      {item.consumable && (
                        <button onClick={() => consume(idx)} className="bg-blue-600 text-[8px] px-2 py-1 text-white hover:bg-blue-500 border border-blue-400">USE</button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="bg-black/50 p-4 border border-emerald-900 rounded mb-6">
                  <div className="text-[10px] text-emerald-400 tracking-widest font-mono text-center">PIN CODES RECOVERED: {secretCode.join(' ')}</div>
                </div>
                <button onClick={() => setGameState(GameState.PLAY)} className="w-full bg-blue-600 py-3 text-white border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 text-[10px]">CLOSE BAG [I]</button>
             </div>
          </div>
        )}

        {gameState === GameState.CHOICE && choice && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setGameState(GameState.PLAY)}>
             <div className="bg-blue-950 border-4 border-white p-8 text-center text-white max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <p className="mb-8 leading-relaxed text-sm">{choice.title}</p>
                <div className="flex flex-col gap-4">
                  {(choice.options || ['YES', 'NO']).map((opt, i) => (
                    <button key={i} onClick={() => choice.onSelect(i)} className="w-full py-3 bg-zinc-800 border-2 border-white hover:bg-zinc-700 active:bg-zinc-900 text-[10px] font-bold tracking-widest uppercase">{opt}</button>
                  ))}
                </div>
             </div>
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white z-[100] p-12 text-center animate-[fadeIn_1s_ease-in]">
            <h1 className="text-4xl mb-12 text-emerald-500 tracking-[0.2em] font-bold">MISSION END</h1>
            <div className="bg-zinc-900 border-2 border-white p-8 mb-12 w-full max-w-sm shadow-2xl">
              <p className="text-2xl mb-4 text-yellow-500 font-mono">SCORE: {player.score}</p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {player.inventory.some(i => i.id === 'MEDICINE') 
                  ? "MISSION SUCCESS!\nYou delivered the medicine and saved Grandma. Hong Kong's hero!" 
                  : "MISSION FAILED...\nYou exited the mall but forgot the medicine. Grandma is still sick."}
              </p>
            </div>
            <button onClick={() => window.location.reload()} className="px-12 py-4 bg-white text-black font-bold border-b-4 border-zinc-400 active:border-b-0 active:translate-y-1 text-[10px] hover:bg-zinc-200 transition-colors tracking-widest">PLAY AGAIN</button>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-8 flex flex-col items-center gap-2 scale-125 md:scale-150">
        <button 
          onMouseDown={() => startDir('w')} onMouseUp={() => stopDir('w')} 
          onTouchStart={(e) => { e.preventDefault(); startDir('w'); }} onTouchEnd={(e) => { e.preventDefault(); stopDir('w'); }}
          className="w-12 h-12 bg-zinc-800 border-4 border-zinc-600 text-white active:bg-zinc-600 active:translate-y-1 rounded shadow-lg">↑</button>
        <div className="flex gap-2">
          <button 
            onMouseDown={() => startDir('a')} onMouseUp={() => stopDir('a')} 
            onTouchStart={(e) => { e.preventDefault(); startDir('a'); }} onTouchEnd={(e) => { e.preventDefault(); stopDir('a'); }}
            className="w-12 h-12 bg-zinc-800 border-4 border-zinc-600 text-white active:bg-zinc-600 active:translate-x-1 rounded shadow-lg">←</button>
          <button 
            onMouseDown={() => startDir('s')} onMouseUp={() => stopDir('s')} 
            onTouchStart={(e) => { e.preventDefault(); startDir('s'); }} onTouchEnd={(e) => { e.preventDefault(); stopDir('s'); }}
            className="w-12 h-12 bg-zinc-800 border-4 border-zinc-600 text-white active:bg-zinc-600 active:translate-y-1 rounded shadow-lg">↓</button>
          <button 
            onMouseDown={() => startDir('d')} onMouseUp={() => stopDir('d')} 
            onTouchStart={(e) => { e.preventDefault(); startDir('d'); }} onTouchEnd={(e) => { e.preventDefault(); stopDir('d'); }}
            className="w-12 h-12 bg-zinc-800 border-4 border-zinc-600 text-white active:bg-zinc-600 active:translate-x-1 rounded shadow-lg">→</button>
        </div>
      </div>
      
      <div className="absolute bottom-8 right-8 flex gap-6 scale-125 md:scale-150">
         <button onClick={() => setGameState(GameState.INVENTORY)} className="w-16 h-16 rounded-full bg-blue-700 border-4 border-white text-white text-[10px] font-bold shadow-2xl active:scale-95 active:bg-blue-600 transition-transform">BAG</button>
         <button onClick={handleInteract} className="w-16 h-16 rounded-full bg-emerald-600 border-4 border-white text-white text-[10px] font-bold shadow-2xl active:scale-95 active:bg-emerald-500 transition-transform">ACT</button>
      </div>

      <div className="crt-overlay pointer-events-none opacity-20"></div>
    </div>
  );
};

export default App;