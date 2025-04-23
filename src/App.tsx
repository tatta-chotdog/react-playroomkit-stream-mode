import { useEffect, useState } from "react";
import {
  insertCoin,
  isStreamScreen,
  onPlayerJoin,
  myPlayer,
  setState,
} from "playroomkit";
import "./styles/styles.css";

// プレイヤーの型定義
type Profile = {
  name: string;
  avatar: string;
};

type Player = {
  id: string;
  profile: Profile;
};

export const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<"lobby" | "playing">("lobby");

  useEffect(() => {
    const initGame = async () => {
      // Playroom Kitの初期化
      await insertCoin({
        streamMode: true,
      });

      // プレイヤー参加時の処理
      onPlayerJoin((playerState) => {
        console.log("Player joined:", playerState);

        // プレイヤー情報の作成
        const newPlayer: Player = {
          id: playerState.id,
          profile: {
            name: playerState.getProfile().name || "Unknown Player",
            avatar:
              playerState.getProfile().photo ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${playerState.id}`,
          },
        };

        setPlayers((prev) => {
          // 同じIDのプレイヤーが既に存在する場合は更新
          const exists = prev.some((p) => p.id === newPlayer.id);
          if (!exists) {
            return [...prev, newPlayer];
          }
          return prev;
        });

        // プレイヤー退出時の処理
        playerState.onQuit(() => {
          console.log("Player quit:", playerState.id);
          setPlayers((prev) => prev.filter((p) => p.id !== playerState.id));
        });
      });

      setGameStarted(true);
    };

    initGame();

    // クリーンアップ関数
    return () => {
      setPlayers([]);
      setGameState("lobby");
    };
  }, []);

  const startGame = () => {
    setState("gameState", "playing");
    setGameState("playing");
  };

  // ストリーム画面（メイン画面）のレンダリング
  const renderStreamScreen = () => (
    <div className="stream-screen">
      <h1>Game Room</h1>
      {gameState === "lobby" ? (
        <>
          <div className="players-list">
            <h2>Players ({players.length})</h2>
            <div className="players-grid">
              {players.map((player) => (
                <div key={player.id} className="player-item">
                  <img
                    src={player.profile.avatar}
                    alt={`${player.profile.name}'s avatar`}
                    onError={(e) => {
                      (
                        e.target as HTMLImageElement
                      ).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${player.id}`;
                    }}
                  />
                  <span>{player.profile.name}</span>
                </div>
              ))}
            </div>
          </div>
          {players.length >= 1 && (
            <button onClick={startGame} className="start-button">
              Start Game
            </button>
          )}
        </>
      ) : (
        <div className="game-area">
          <h2>Game in Progress!</h2>
          {/* ここにゲームのメイン画面を実装 */}
        </div>
      )}
    </div>
  );

  // コントローラー画面（プレイヤー画面）のレンダリング
  const renderControllerScreen = () => {
    const currentPlayerState = myPlayer();
    const currentPlayer = currentPlayerState
      ? {
          id: currentPlayerState.id,
          profile: {
            name: currentPlayerState.getProfile().name || "Unknown Player",
            avatar:
              currentPlayerState.getProfile().photo ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${currentPlayerState.id}`,
          },
        }
      : null;

    return (
      <div className="controller-screen">
        <h1>Player Screen</h1>
        {gameState === "lobby" ? (
          <div className="waiting-message">
            <h2>Waiting for game to start...</h2>
            {currentPlayer && (
              <div className="current-player">
                <img
                  src={currentPlayer.profile.avatar}
                  alt="Your avatar"
                  onError={(e) => {
                    (
                      e.target as HTMLImageElement
                    ).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentPlayer.id}`;
                  }}
                />
                <p>You are joined as: {currentPlayer.profile.name}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="game-controls">
            {/* ここにプレイヤーのコントロール要素を実装 */}
            <h2>Game Controls</h2>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      {!gameStarted ? (
        <div>Loading...</div>
      ) : isStreamScreen() ? (
        renderStreamScreen()
      ) : (
        renderControllerScreen()
      )}
    </div>
  );
};
