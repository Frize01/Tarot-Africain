
export interface GameData {
  title: string
  description: string
  playerCount: { min: number; max: number }
  tags: { title: string; color: string }[]
  rooms: { id: string; name: string; players: number; max: number; open: boolean; private: boolean }[]
  leaderboard: { rank: number; name: string; games: number; winRate: string }[]
}

export const GAMES_DATA: Record<string, GameData> = {
  tarot_africain: {
    title: 'Tarot Africain',
    description:
      'Un jeu de cartes stratégique pour 3 à 5 joueurs. Formez des équipes, annoncez vos contrats et remportez les plis grâce à vos atouts. Chaque partie est unique — les alliances changent, la fortune aussi.',
    playerCount: { min: 3, max: 5 },
    tags: [
      { title: 'Famille', color: '#42b883' },
      { title: 'Jeux de Cartes', color: '#3178c6' },
    ],
    rooms: [
      { id: 'r1', name: 'Room #1', players: 3, max: 5, open: true, private: true },
      { id: 'r2', name: 'Room #2', players: 5, max: 5, open: false, private: false },
      { id: 'r3', name: 'Room #3', players: 1, max: 5, open: true, private: false },
    ],
    leaderboard: [
      { rank: 1, name: 'John Carter', games: 153, winRate: '85%' },
      { rank: 2, name: 'Amara Diallo', games: 121, winRate: '78%' },
      { rank: 3, name: 'Kofi Mensah', games: 98, winRate: '71%' },
      { rank: 4, name: 'Fatou Ndiaye', games: 76, winRate: '66%' },
      { rank: 5, name: 'Luc Okonkwo', games: 54, winRate: '60%' },
    ],
  },
}
