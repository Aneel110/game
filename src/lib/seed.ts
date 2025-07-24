'use server';

import { db } from './firebase-admin';

const tournamentData = [
  { id: '1', name: 'Arena Clash: Season 5', date: '2024-08-15', prize: '50000', status: 'Upcoming', image: 'https://placehold.co/600x400.png', dataAiHint: 'esports battle', description: 'The fifth season of the epic Arena Clash. Squads will battle it out for a massive prize pool and eternal glory.' },
  { id: '2', name: 'Solo Survival Challenge', date: '2024-08-20', prize: '10000', status: 'Upcoming', image: 'https://placehold.co/600x400.png', dataAiHint: 'lone soldier', description: 'Think you have what it takes to be the last one standing? Prove your skills in this high-stakes solo tournament.' },
  { id: '3', name: 'Duo Destruction Derby', date: '2024-08-25', prize: '25000', status: 'Upcoming', image: 'https://placehold.co/600x400.png', dataAiHint: 'gaming partners', description: 'Grab a partner and get ready for a chaotic derby. Teamwork and strategy are key to victory.' },
  { id: '4', name: 'Squad Goals Championship', date: '2024-09-01', prize: '100000', status: 'Upcoming', image: 'https://placehold.co/600x400.png', dataAiHint: 'team victory', description: 'The ultimate test for any squad. Compete against the best of the best for the championship title.' },
  { id: '5', name: 'Summer Skirmish', date: '2024-07-10', prize: '20000', status: 'Ongoing', image: 'https://placehold.co/600x400.png', dataAiHint: 'intense conflict', description: 'A fast-paced tournament to celebrate the summer season. Quick matches, constant action.' },
  { id: '6', name: 'King of the Hill', date: '2024-07-01', prize: '5000', status: 'Finished', image: 'https://placehold.co/600x400.png', dataAiHint: 'royal crown', description: 'A classic King of the Hill tournament. Hold the objective to score points and claim your crown.' },
];

const leaderboardData = [
  { rank: 1, player: 'ShadowStriker', points: 5420, wins: 25, tier: 'Conqueror' },
  { rank: 2, player: 'Phoenix', points: 5310, wins: 22, tier: 'Conqueror' },
  { rank: 3, player: 'Viper', points: 5150, wins: 19, tier: 'Ace Master' },
  { rank: 4, player: 'Ghost', points: 4980, wins: 15, tier: 'Ace Master' },
  { rank: 5, player: 'Blitz', points: 4800, wins: 18, tier: 'Ace' },
  { rank: 6, player: 'Rogue', points: 4650, wins: 12, tier: 'Ace' },
  { rank: 7, player: 'Reaper', points: 4500, wins: 14, tier: 'Crown' },
  { rank: 8, player: 'Fury', points: 4350, wins: 10, tier: 'Crown' },
  { rank: 9, player: 'Warden', points: 4200, wins: 9, tier: 'Diamond' },
  { rank: 10, player: 'Nomad', points: 4100, wins: 11, tier: 'Diamond' },
];

const userData = {
  name: "ShadowStriker",
  avatar: "https://placehold.co/128x128.png",
  bio: "Pro player since 2018. IGL for team Vipers. Streaming competitive gameplay daily.",
  stats: [
    { label: "K/D Ratio", value: "4.75" },
    { label: "Wins", value: "128" },
    { label: "Avg. Damage", value: "650.2" },
    { label: "Tournaments Won", value: "5" },
  ],
  achievements: [
    { name: "Tournament Champion", icon: "Trophy" },
    { name: "First Win", icon: "Shield" },
    { name: "Community Contributor", icon: "GitCommitHorizontal" },
    { name: "Season 1 Veteran", icon: "Trophy" },
  ],
};

const initialRegistrations = [
    { tournamentId: '1', userId: 'shadowstriker_profile', userName: 'ShadowStriker', userAvatar: "https://placehold.co/40x40.png", status: 'approved' },
    { tournamentId: '1', userId: 'phoenix_profile', userName: 'Phoenix', userAvatar: "https://placehold.co/40x40.png", status: 'approved' },
    { tournamentId: '1', userId: 'viper_profile', userName: 'Viper', userAvatar: "https://placehold.co/40x40.png", status: 'pending' },
];


export async function seedDatabase() {
  const batch = db.batch();

  // Seed Tournaments
  const tournamentsCol = db.collection('tournaments');
  tournamentData.forEach(t => {
    const docRef = tournamentsCol.doc(t.id);
    batch.set(docRef, t);
  });
  console.log('Tournaments queued for seeding.');

  // Seed Leaderboard
  const leaderboardCol = db.collection('leaderboard');
  leaderboardData.forEach(p => {
    const docRef = leaderboardCol.doc(String(p.rank));
    batch.set(docRef, p);
  });
  console.log('Leaderboard queued for seeding.');
  
  // Seed User Profile
  const usersCol = db.collection('users');
  const userRef = usersCol.doc('shadowstriker_profile');
  batch.set(userRef, userData);
  console.log('User profile queued for seeding.');
  
  // Seed initial registrations
  initialRegistrations.forEach(reg => {
    const regRef = db.collection('tournaments').doc(reg.tournamentId).collection('registrations').doc(reg.userId);
    batch.set(regRef, {
        ...reg,
        registeredAt: new Date()
    });
  });
  console.log('Initial registrations queued for seeding.');


  try {
    await batch.commit();
    console.log('Database seeded successfully!');
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, message: 'Error seeding database.' };
  }
}
