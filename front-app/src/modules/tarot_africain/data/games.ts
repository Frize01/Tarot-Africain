
// export interface GameData {
//   id: string
//   routeName: string
//   title: string
//   description: string
//   playerCount: { min: number; max: number }
//   tags: { title: string; color: string }[]
//   rooms: { id: string; name: string; players: number; max: number; open: boolean; private: boolean }[]
//   leaderboard: { rank: number; name: string; games: number; winRate: string }[]
//   cards: { id: number; name: string; value: number | null; image: string }[]
// }

export const GAMES_DATA= {
  tarot_africain: {
    id: 'tarot_africain',
    title: 'Tarot Africain',
    routeName: 'TarotAfricain',
    description:
      "Un jeu d’atouts pour 3 à 5 joueurs : annoncez vos plis, gérez vos vies et adaptez votre stratégie à chaque manche. Prédisez, bluffez, et restez le dernier en lice pour gagner la partie !",
    playerCount: { min: 3, max: 5 },
    tags: [
      { title: 'Famille', color: '#42b883' },
      { title: 'Jeux de Cartes', color: '#3178c6' },
      { title: 'Rapide', color: '#f59e0b' },

    ],
    rooms: [
      { id: '123456', name: 'Room #1', players: 3, max: 5, open: true, private: true },
      { id: '234567', name: 'Room #2', players: 5, max: 5, open: false, private: false },
      { id: '345678', name: 'Room #3', players: 1, max: 5, open: true, private: false },
    ],
    cards:[
      { id:0,   name:"L'Excuse",            value:null, image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:1,   name:'Le Bateleur',         value:1,    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:2,   name:'La Papesse',          value:2,    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:3,   name:"L'Impératrice",       value:3,    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:4,   name:"L'Empereur",          value:4,    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:5,   name:"Le Pape",             value:5,    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:6,   name:"L'Amoureux",          value:6,    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:7,   name:"Le Chariot",          value:7,    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:8,   name:"La Justice",          value:8,    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:9,   name:"L'Ermite",            value:9,    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:10,  name:"La Roue de Fortune",  value:10,   image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:11,  name:"La Force",            value:11,   image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:12,  name:"Le Pendu",            value:12,   image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:13,  name:"La Mort",             value:13,   image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:14,  name:"La Tempérance",       value:14,   image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:15,  name:"Le Diable",           value:15,   image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:16,  name:"La Maison Dieu",      value:16,   image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:17,  name:"L'Étoile",            value:17,   image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:18,  name:"La Lune",             value:18,   image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:19,  name:"Le Soleil",           value:19,   image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:20,  name:"Le Jugement",         value:20,   image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
      { id:21,  name:"Le Monde",            value:21,   image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH04I_HS-NJX4XKNGTSKNIGlRe-9AKbkyLIg&s" },
    ]
  },
}
