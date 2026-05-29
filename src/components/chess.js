export function initChess() {
  const boardEl = document.getElementById('board');
  const statusText = document.getElementById('puzzle-status-text');
  const statusIndicator = document.querySelector('.status-indicator-dot');
  const resetBtn = document.getElementById('reset-puzzle-btn');

  if (!boardEl || !statusText || !statusIndicator || !resetBtn) {
    console.warn('Chess Arena UI elements not fully found in HTML');
    return;
  }

  // Board representation (8x8 grid: rows 0-7, cols 0-7)
  // Row 0 represents Rank 8, Row 7 represents Rank 1
  // Col 0 represents File A, Col 7 represents File H
  const initialBoardState = {
    // Black Pieces
    '0,0': { symbol: '♜', side: 'black', type: 'rook' },
    '0,3': { symbol: '♛', side: 'black', type: 'queen' },
    '0,4': { symbol: '♚', side: 'black', type: 'king' },
    '0,5': { symbol: '♝', side: 'black', type: 'bishop' },
    '0,7': { symbol: '♜', side: 'black', type: 'rook' },
    '1,0': { symbol: '♟', side: 'black', type: 'pawn' },
    '1,1': { symbol: '♟', side: 'black', type: 'pawn' },
    '1,2': { symbol: '♟', side: 'black', type: 'pawn' },
    '1,5': { symbol: '♟', side: 'black', type: 'pawn', target: true }, // The checkmate target square f7!
    '1,6': { symbol: '♟', side: 'black', type: 'pawn' },
    '1,7': { symbol: '♟', side: 'black', type: 'pawn' },
    '2,2': { symbol: '♞', side: 'black', type: 'knight' },
    '2,5': { symbol: '♞', side: 'black', type: 'knight' },
    '2,3': { symbol: '♟', side: 'black', type: 'pawn' },
    '3,2': { symbol: '♝', side: 'black', type: 'bishop' },
    '3,4': { symbol: '♟', side: 'black', type: 'pawn' },

    // White Pieces
    '4,4': { symbol: '♙', side: 'white', type: 'pawn' },
    '4,2': { symbol: '♗', side: 'white', type: 'bishop', id: 'white-bishop' }, // The bishop on c4 protecting f7
    '5,3': { symbol: '♙', side: 'white', type: 'pawn' },
    '5,5': { symbol: '♕', side: 'white', type: 'queen', id: 'white-queen' }, // The White Queen on f3!
    '6,0': { symbol: '♙', side: 'white', type: 'pawn' },
    '6,1': { symbol: '♙', side: 'white', type: 'pawn' },
    '6,2': { symbol: '♙', side: 'white', type: 'pawn' },
    '6,6': { symbol: '♙', side: 'white', type: 'pawn' },
    '6,7': { symbol: '♙', side: 'white', type: 'pawn' },
    '7,0': { symbol: '♖', side: 'white', type: 'rook' },
    '7,4': { symbol: '♔', side: 'white', type: 'king' },
    '7,5': { symbol: '♖', side: 'white', type: 'rook' }
  };

  let currentBoard = { ...initialBoardState };
  let selectedSquare = null;
  let isPuzzleSolved = false;

  // Render the Chess board
  function renderBoard() {
    boardEl.innerHTML = '';
    selectedSquare = null;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const squareKey = `${row},${col}`;
        const isLight = (row + col) % 2 === 0;
        
        const square = document.createElement('div');
        square.className = `board-square ${isLight ? 'light-sq' : 'dark-sq'}`;
        square.dataset.row = row;
        square.dataset.col = col;

        const piece = currentBoard[squareKey];
        if (piece) {
          const pieceEl = document.createElement('div');
          pieceEl.className = `chess-piece ${piece.side}-pc`;
          pieceEl.textContent = piece.symbol;
          
          if (!isPuzzleSolved && piece.side === 'white' && piece.type === 'queen') {
            pieceEl.style.cursor = 'pointer';
          }
          square.appendChild(pieceEl);
        }

        // Click handler for interactions
        square.addEventListener('click', () => handleSquareClick(row, col));
        boardEl.appendChild(square);
      }
    }
  }

  // Handle Square clicks
  function handleSquareClick(row, col) {
    if (isPuzzleSolved) return;

    const clickedKey = `${row},${col}`;
    const piece = currentBoard[clickedKey];

    // Case 1: Select the White Queen (row 5, col 5 is the starting 'f3')
    if (piece && piece.side === 'white' && piece.type === 'queen') {
      clearHighlights();
      selectedSquare = clickedKey;
      
      const sqEl = getSquareElement(row, col);
      sqEl.classList.add('selected');
      
      // Highlight valid checkmate destination f7 (row 1, col 5)
      const targetSqEl = getSquareElement(1, 5);
      if (targetSqEl) {
        targetSqEl.classList.add('valid-move');
      }
      
      statusText.textContent = "Queen selected! Where will you deliver the fatal blow?";
      return;
    }

    // Case 2: Attempting a move with Queen selected
    if (selectedSquare) {
      const [selRow, selCol] = selectedSquare.split(',').map(Number);
      
      // Check if moving to the correct checkmate square (f7 -> row 1, col 5)
      if (row === 1 && col === 5) {
        // Move White Queen to f7
        const queenPiece = currentBoard[selectedSquare];
        delete currentBoard[selectedSquare];
        currentBoard[clickedKey] = { ...queenPiece, symbol: '♕' };
        
        isPuzzleSolved = true;
        clearHighlights();
        renderBoard();
        
        // Highlight checkmate square
        const checkmateSq = getSquareElement(1, 5);
        checkmateSq.classList.add('checkmate-glowing');

        // Success banner
        statusText.textContent = "CHECKMATE! 🏆 Outstanding strategy! You solved Scholar's Mate.";
        statusIndicator.className = "status-indicator-dot green-pulse";
        
        triggerConfetti();
      } else {
        // Invalid checkmate square click
        clearHighlights();
        selectedSquare = null;
        statusText.textContent = "Incorrect move! That doesn't deliver immediate mate. Try again.";
        
        // Shake board on error
        boardEl.style.animation = 'shake 0.5s';
        setTimeout(() => {
          boardEl.style.animation = '';
        }, 500);
      }
    } else {
      statusText.textContent = "Select your key attacking piece (the White Queen ♕) to begin.";
    }
  }

  function getSquareElement(row, col) {
    return boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }

  function clearHighlights() {
    const squares = boardEl.querySelectorAll('.board-square');
    squares.forEach(sq => {
      sq.classList.remove('selected', 'valid-move');
    });
  }

  // Custom visual Confetti emitter using DOM
  function triggerConfetti() {
    const container = document.getElementById('chess');
    const colors = ['#8b5cf6', '#22d3ee', '#10b981', '#f59e0b', '#ef4444'];
    
    for (let i = 0; i < 60; i++) {
      const confetti = document.createElement('div');
      
      // Styling
      confetti.style.position = 'absolute';
      confetti.style.width = `${Math.random() * 8 + 4}px`;
      confetti.style.height = `${Math.random() * 8 + 4}px`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '2px';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '1000';
      
      // Starting Position
      const rect = boardEl.getBoundingClientRect();
      const relativeTop = rect.top + window.scrollY + rect.height / 2;
      const relativeLeft = rect.left + window.scrollX + rect.width / 2;
      
      confetti.style.top = `${relativeTop}px`;
      confetti.style.left = `${relativeLeft}px`;
      
      document.body.appendChild(confetti);
      
      // Animation Physics
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 12 + 6;
      let vx = Math.cos(angle) * velocity;
      let vy = Math.sin(angle) * velocity - 5; // push upwards initially
      let top = relativeTop;
      let left = relativeLeft;
      
      let opacity = 1;
      
      const updatePhysics = () => {
        vy += 0.45; // gravity
        top += vy;
        left += vx;
        opacity -= 0.015;
        
        confetti.style.top = `${top}px`;
        confetti.style.left = `${left}px`;
        confetti.style.opacity = opacity;
        
        if (opacity > 0) {
          requestAnimationFrame(updatePhysics);
        } else {
          confetti.remove();
        }
      };
      
      requestAnimationFrame(updatePhysics);
    }
  }

  // Reset puzzle handler
  resetBtn.addEventListener('click', () => {
    currentBoard = { ...initialBoardState };
    isPuzzleSolved = false;
    statusText.textContent = "Puzzle Reset. White Queen is back on f3. Deliver the checkmate!";
    statusIndicator.className = "status-indicator-dot yellow-pulse";
    renderBoard();
  });

  // Initial render
  renderBoard();
}

// Add board shaking animations to index.css
const cssRule = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }
`;
const styleEl = document.createElement('style');
styleEl.textContent = cssRule;
document.head.appendChild(styleEl);
