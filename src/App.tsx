import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_KEY = '1c7e071a-236f-419f-bcf4-282f3276f8f5';

const ALL_BALLS = [
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/timer-ball.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-ball.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dusk-ball.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/luxury-ball.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/premier-ball.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/repeat-ball.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/nest-ball.png',
];

const TYPE_DATA = [
  { name: 'Todos', color: '#4b5563' },
  { name: 'Fire', color: '#ff4422' },
  { name: 'Water', color: '#3399ff' },
  { name: 'Grass', color: '#77cc55' },
  { name: 'Lightning', color: '#ffcc33' },
  { name: 'Psychic', color: '#ff5599' },
  { name: 'Fighting', color: '#bb5544' },
  { name: 'Darkness', color: '#705848' },
  { name: 'Metal', color: '#aaaabb' },
  { name: 'Colorless', color: '#a8a878' },
  { name: 'Dragon', color: '#7766ee' },
  { name: 'Fairy', color: '#ee99ee' },
];

export default function App() {
  const [sets, setSets] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('CARGANDO EXPANSIONES...');
  const [progress, setProgress] = useState(0);
  const [view, setView] = useState<'sets' | 'cards'>('sets');
  const [searchSet, setSearchSet] = useState('');
  const [searchCard, setSearchCard] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedSetName, setSelectedSetName] = useState('');
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [ballIndex, setBallIndex] = useState(0);

  const progressTimer = useRef<any>(null);

  // Cambio de bola sincronizado a 2.5 segundos (2500ms)
  useEffect(() => {
    if (loading) {
      const ballTimer = setInterval(() => {
        setBallIndex((prev) => (prev + 1) % ALL_BALLS.length);
      }, 2500);
      return () => clearInterval(ballTimer);
    }
  }, [loading]);

  useEffect(() => {
    handleLoad(
      'https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate',
      'sets'
    );
  }, []);

  const handleLoad = async (url: string, type: 'sets' | 'cards') => {
    setLoading(true);
    setProgress(0);
    if (progressTimer.current) clearInterval(progressTimer.current);

    progressTimer.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 70) return prev + 2;
        if (prev < 90) return prev + 0.5;
        if (prev < 98) return prev + 0.1;
        return 98;
      });
    }, 15);

    try {
      const response = await fetch(url, { headers: { 'X-Api-Key': API_KEY } });
      const data = await response.json();

      clearInterval(progressTimer.current);
      setProgress(100);

      if (type === 'sets') setSets(data.data);
      else {
        setCards(data.data);
        setView('cards');
      }
      setTimeout(() => setLoading(false), 300);
    } catch (e) {
      setLoading(false);
      clearInterval(progressTimer.current);
    }
  };

  const loadCards = (set: any) => {
    setLoadingMsg('CARGANDO CARTAS...');
    setSelectedSetName(set.name);
    setSearchCard('');
    handleLoad(
      `https://api.pokemontcg.io/v2/cards?q=set.id:${set.id}`,
      'cards'
    );
  };

  const goBack = () => {
    setView('sets');
    setSelectedSetName('');
    setSelectedType('Todos');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            {view === 'cards' && !loading && (
              <button className="btn-back" onClick={goBack}>
                ← VOLVER
              </button>
            )}
          </div>
          <div className="header-center">
            <h1 className="title">PokeCards</h1>
          </div>
          <div className="header-right">
            <input
              className="search-input"
              placeholder="BUSCAR..."
              value={view === 'sets' ? searchSet : searchCard}
              onChange={(e) =>
                view === 'sets'
                  ? setSearchSet(e.target.value)
                  : setSearchCard(e.target.value)
              }
            />
          </div>
        </div>
      </header>

      {view === 'cards' && !loading && (
        <div className="filter-section">
          <div className="set-indicator">
            <h2 className="subtitle">{selectedSetName}</h2>
          </div>
          <div className="filter-bar">
            {TYPE_DATA.map((t) => (
              <button
                key={t.name}
                className={`filter-btn ${
                  selectedType === t.name ? 'active' : ''
                }`}
                style={{
                  backgroundColor:
                    selectedType === t.name ? t.color : '#1e293b',
                  borderColor: t.color,
                }}
                onClick={() => setSelectedType(t.name)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <main>
        {loading ? (
          <div className="loader">
            <div className="ball-wrapper">
              <div className="ball-container">
                <img
                  key={ballIndex}
                  src={ALL_BALLS[ballIndex]}
                  className="single-ball"
                  alt="ball"
                />
              </div>
            </div>
            <h2 className="loading-text">{loadingMsg}</h2>
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="percentage">{Math.floor(progress)}%</div>
          </div>
        ) : (
          <div className="grid">
            {view === 'sets'
              ? sets
                  .filter((s) =>
                    s.name.toLowerCase().includes(searchSet.toLowerCase())
                  )
                  .map((s: any) => (
                    <div
                      key={s.id}
                      className="card-set"
                      onClick={() => loadCards(s)}
                    >
                      <div className="set-logo-container">
                        <img
                          src={s.images.logo}
                          className="set-logo"
                          alt="logo"
                        />
                      </div>
                      <p className="set-name-text">{s.name}</p>
                    </div>
                  ))
              : cards
                  .filter((c) => {
                    const matchesSearch = c.name
                      .toLowerCase()
                      .includes(searchCard.toLowerCase());
                    const matchesType =
                      selectedType === 'Todos' ||
                      (c.types && c.types.includes(selectedType));
                    return matchesSearch && matchesType;
                  })
                  .map((c: any) => (
                    <div
                      key={c.id}
                      className="card-pokemon"
                      onClick={() => setSelectedCard(c)}
                    >
                      <img
                        src={c.images.small}
                        className="card-img"
                        alt="card"
                      />
                      <p className="poke-name-text">{c.name}</p>
                      <p className="price-neon">
                        €{c.cardmarket?.prices?.averageSellPrice || '0.00'}
                      </p>
                    </div>
                  ))}
          </div>
        )}
      </main>

      {selectedCard && (
        <div className="overlay" onClick={() => setSelectedCard(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelectedCard(null)}>
              ×
            </button>
            <div className="modal-content">
              <div className="modal-left">
                <img
                  src={selectedCard.images.large}
                  className="modal-img"
                  alt="card"
                />
              </div>
              <div className="modal-right">
                <h1 className="modal-title-main">{selectedCard.name}</h1>
                <div className="modal-badges">
                  <span className="badge-type">
                    {selectedCard.types?.[0] || 'Neutral'}
                  </span>
                  <span className="badge-hp">HP {selectedCard.hp || '??'}</span>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <span>RAREZA:</span> <p>{selectedCard.rarity || 'Común'}</p>
                  </div>
                  <div className="info-item">
                    <span>ARTISTA:</span>{' '}
                    <p>{selectedCard.artist || 'Desconocido'}</p>
                  </div>
                  <div className="info-item">
                    <span>NÚMERO:</span>{' '}
                    <p>
                      {selectedCard.number} / {selectedCard.set.printedTotal}
                    </p>
                  </div>
                  <div className="info-item">
                    <span>EXPANSIÓN:</span> <p>{selectedCard.set.name}</p>
                  </div>
                </div>
                <div className="price-section-mini">
                  <p className="price-label">PRECIO MEDIO</p>
                  <p className="price-value-mini">
                    €
                    {selectedCard.cardmarket?.prices?.averageSellPrice || '---'}
                  </p>
                </div>
                <div className="button-group-mini">
                  <a
                    href={selectedCard.cardmarket?.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-shop-mini cm"
                  >
                    CARDMARKET
                  </a>
                  <a
                    href={`https://www.pricecharting.com/search-products?q=${encodeURIComponent(
                      selectedCard.name + ' ' + selectedCard.number
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-shop-mini pc"
                  >
                    PRICECHARTING
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
