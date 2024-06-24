import React, { useState, useEffect } from 'react';

const GRID_SIZE = 8;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const Tile = ({ letter, onClick, isSelected, offset }) => (
  <button
    style={{
      width: '40px',
      height: '40px',
      margin: '2px',
      fontSize: '20px',
      fontWeight: 'bold',
      backgroundColor: isSelected ? 'lightblue' : 'white',
      border: '1px solid black',
      cursor: 'pointer',
      position: 'relative',
      top: offset ? '20px' : '0',
    }}
    onClick={onClick}
  >
    {letter}
  </button>
);

const BookwormGame = () => {
  const [grid, setGrid] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const newGrid = Array(GRID_SIZE).fill().map(() =>
      Array(GRID_SIZE).fill().map(() => LETTERS[Math.floor(Math.random() * LETTERS.length)])
    );
    setGrid(newGrid);
  };

  const handleTileClick = (row, col) => {
    if (isAdjacent(row, col)) {
      const newSelectedTiles = [...selectedTiles, { row, col }];
      setSelectedTiles(newSelectedTiles);
      setCurrentWord(currentWord + grid[row][col]);
    }
  };

  const isAdjacent = (row, col) => {
    if (selectedTiles.length === 0) return true;
    const lastTile = selectedTiles[selectedTiles.length - 1];
    return Math.abs(row - lastTile.row) <= 1 && Math.abs(col - lastTile.col) <= 1;
  };

  const submitWord = async () => {
    if (currentWord.length < 3) {
      setMessage('Word must be at least 3 letters long.');
      return;
    }

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentWord.toLowerCase()}`);
      if (response.ok) {
        setScore(score + currentWord.length);
        setMessage(`'${currentWord}' is valid! +${currentWord.length} points.`);
        removeTiles();
      } else {
        setMessage(`'${currentWord}' is not a valid word.`);
        resetSelection();
      }
    } catch (error) {
      console.error('Error validating word:', error);
      setMessage('Error validating word. Please try again.');
      resetSelection();
    }
  };

  const removeTiles = () => {
    const newGrid = [...grid];
    selectedTiles.forEach(({ row, col }) => {
      for (let i = row; i > 0; i--) {
        newGrid[i][col] = newGrid[i-1][col];
      }
      newGrid[0][col] = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    });
    setGrid(newGrid);
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedTiles([]);
    setCurrentWord('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1>Bookworm</h1>
      <div>Score: {score}</div>
      <div>Current Word: {currentWord}</div>
      <div>{message}</div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${GRID_SIZE}, auto)`, 
        gap: '2px', 
        margin: '10px',
        position: 'relative',
      }}>
        {grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => (
            <Tile
              key={`${rowIndex}-${colIndex}`}
              letter={letter}
              onClick={() => handleTileClick(rowIndex, colIndex)}
              isSelected={selectedTiles.some(t => t.row === rowIndex && t.col === colIndex)}
              offset={colIndex % 2 === 1}
            />
          ))
        )}
      </div>
      <button onClick={submitWord} style={{ marginTop: '10px', padding: '5px 10px' }}>Submit Word</button>
    </div>
  );
};

export default BookwormGame;