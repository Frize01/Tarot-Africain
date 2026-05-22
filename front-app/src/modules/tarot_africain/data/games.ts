
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
      { id:0,   name:"L'Excuse",            value:null, image:"/tarot_card/0.jpg" },
      { id:1,   name:'Le Bateleur',         value:1,    image:"/tarot_card/1.jpg" },
      { id:2,   name:'La Papesse',          value:2,    image:"/tarot_card/2.jpg" },
      { id:3,   name:"L'Impératrice",       value:3,    image:"/tarot_card/3.jpg" },
      { id:4,   name:"L'Empereur",          value:4,    image:"/tarot_card/4.jpg" },
      { id:5,   name:"Le Pape",             value:5,    image:"/tarot_card/5.jpg" },
      { id:6,   name:"L'Amoureux",          value:6,    image:"/tarot_card/6.jpg" },
      { id:7,   name:"Le Chariot",          value:7,    image:"/tarot_card/7.jpg" },
      { id:8,   name:"La Justice",          value:8,    image:"/tarot_card/8.jpg" },
      { id:9,   name:"L'Ermite",            value:9,    image:"/tarot_card/9.jpg" },
      { id:10,  name:"La Roue de Fortune",  value:10,   image:"/tarot_card/10.jpg" },
      { id:11,  name:"La Force",            value:11,   image:"/tarot_card/11.jpg" },
      { id:12,  name:"Le Pendu",            value:12,   image:"/tarot_card/12.jpg" },
      { id:13,  name:"La Mort",             value:13,   image:"/tarot_card/13.jpg" },
      { id:14,  name:"La Tempérance",       value:14,   image:"/tarot_card/14.jpg" },
      { id:15,  name:"Le Diable",           value:15,   image:"/tarot_card/15.jpg" },
      { id:16,  name:"La Maison Dieu",      value:16,   image:"/tarot_card/16.jpg" },
      { id:17,  name:"L'Étoile",            value:17,   image:"/tarot_card/17.jpg" },
      { id:18,  name:"La Lune",             value:18,   image:"/tarot_card/18.jpg" },
      { id:19,  name:"Le Soleil",           value:19,   image:"/tarot_card/19.jpg" },
      { id:20,  name:"Le Jugement",         value:20,   image:"/tarot_card/20.jpg" },
      { id:21,  name:"Le Monde",            value:21,   image:"/tarot_card/21.jpg" },
    ]
  },
  belote: {
    id: 'belote',
    title: 'Belote',
    routeName: 'Belote',
    description:
      "Un jeu de plis pour 4 joueurs en équipes de 2 : annoncez vos contrats, jouez vos cartes et collaborez avec votre partenaire pour remporter la partie !",
    playerCount: { min: 4, max: 4 },
    tags: [
      { title: 'Famille', color: '#42b883' },
      { title: 'Jeux de Cartes', color: '#3178c6' },
      { title: 'Stratégique', color: '#f59e0b' },
    ],
    rooms: [
      { id: '456789', name: 'Room #1', players: 4, max: 4, open: true, private: false },
      { id: '567890', name: 'Room #2', players: 3, max: 4, open: true, private: true },
      { id: '678901', name: 'Room #3', players: 4, max: 4, open: false, private: false },
    ],
    cards: []
  },
}
