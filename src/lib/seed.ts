

'use server';

import { db } from './firebase-admin';

const tournamentLeaderboard = [
  { rank: 1, player: 'ShadowStriker', points: 5420, matches: 150, chickenDinners: 25 },
  { rank: 2, player: 'Phoenix', points: 5310, matches: 145, chickenDinners: 22 },
  { rank: 3, player: 'Viper', points: 5150, matches: 140, chickenDinners: 19 },
  { rank: 4, player: 'Ghost', points: 4980, matches: 160, chickenDinners: 15 },
  { rank: 5, player: 'Blitz', points: 4800, matches: 130, chickenDinners: 18 },
];

const tournamentData = [
  { id: '1', name: 'Arena Clash: Season 5', date: '2024-08-15', prize: '50000', status: 'Upcoming', image: 'https://placehold.co/600x400.png', dataAiHint: 'esports battle', description: 'The fifth season of the epic Arena Clash. Squads will battle it out for a massive prize pool and eternal glory.', leaderboard: [] },
  { id: '2', name: 'Solo Survival Challenge', date: '2024-08-20', prize: '10000', status: 'Upcoming', image: 'https://placehold.co/600x400.png', dataAiHint: 'lone soldier', description: 'Think you have what it takes to be the last one standing? Prove your skills in this high-stakes solo tournament.', leaderboard: [] },
  { id: '3', name: 'Duo Destruction Derby', date: '2024-08-25', prize: '25000', status: 'Upcoming', image: 'https://placehold.co/600x400.png', dataAiHint: 'gaming partners', description: 'Grab a partner and get ready for a chaotic derby. Teamwork and strategy are key to victory.', leaderboard: [] },
  { id: '4', name: 'Squad Goals Championship', date: '2024-09-01', prize: '100000', status: 'Upcoming', image: 'https://placehold.co/600x400.png', dataAiHint: 'team victory', description: 'The ultimate test for any squad. Compete against the best of the best for the championship title.', leaderboard: [] },
  { id: '5', name: 'Summer Skirmish', date: '2024-07-10', prize: '20000', status: 'Ongoing', image: 'https://placehold.co/600x400.png', dataAiHint: 'intense conflict', description: 'A fast-paced tournament to celebrate the summer season. Quick matches, constant action.', leaderboard: [] },
  { id: '6', name: 'King of the Hill', date: '2024-07-01', prize: '5000', status: 'Finished', image: 'https://placehold.co/600x400.png', dataAiHint: 'royal crown', description: 'A classic King of the Hill tournament. Hold the objective to score points and claim your crown.', leaderboard: tournamentLeaderboard },
];

const userData = {
  name: "ShadowStriker",
  avatar: "https://placehold.co/128x128.png",
  bio: "Pro player since 2018. IGL for team Vipers. Streaming competitive gameplay daily.",
  role: "admin",
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

const samplePlayers = [
    { pubgName: 'PlayerOne', pubgId: '5123456789', discordUsername: 'playerone#1111' },
    { pubgName: 'PlayerTwo', pubgId: '5234567890' },
    { pubgName: 'PlayerThree', pubgId: '5345678901', discordUsername: 'playerthree#3333' },
    { pubgName: 'PlayerFour', pubgId: '5456789012' },
];

const initialRegistrations = [
    { tournamentId: '1', registeredById: 'user1', registeredByName: 'AlphaTeam', teamName: 'Alpha Wolves', teamTag: 'AW', status: 'approved', players: samplePlayers },
    { tournamentId: '1', registeredById: 'user2', registeredByName: 'BravoTeam', teamName: 'Bravo Knights', teamTag: 'BK', status: 'approved', players: samplePlayers },
    { tournamentId: '1', registeredById: 'user3', registeredByName: 'CharlieTeam', teamName: 'Charlie Dragons', teamTag: 'CD', status: 'pending', players: samplePlayers },
];

const streamData = [
    { id: '1', title: 'Grand Finals - Arena Clash: Season 4', youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'Live', createdAt: new Date() },
    { id: '2', title: 'Upcoming: Pro Player Interview with ShadowStriker', youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'Upcoming', createdAt: new Date(Date.now() - 86400000 * 1) },
    { id: '3', title: 'Top 10 Plays from the Summer Skirmish', youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'Past', createdAt: new Date(Date.now() - 86400000 * 2) },
    { id: '4', title: 'Patch 25.2 Rundown and Analysis', youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'Past', createdAt: new Date(Date.now() - 86400000 * 3) },
];

export async function seedDatabase() {
  if (!db) {
    return { success: false, message: 'Database not initialized.' };
  }
  const batch = db.batch();

  // Seed Tournaments
  const tournamentsCol = db.collection('tournaments');
  tournamentData.forEach(t => {
    const docRef = tournamentsCol.doc(t.id);
    batch.set(docRef, t);
  });
  console.log('Tournaments queued for seeding.');
  
  // Seed User Profile
  const usersCol = db.collection('users');
  const userRef = usersCol.doc('shadowstriker_profile');
  batch.set(userRef, userData);
  console.log('User profile queued for seeding.');
  
  // Seed initial registrations
  initialRegistrations.forEach(reg => {
    const regRef = db.collection('tournaments').doc(reg.tournamentId).collection('registrations').doc(reg.registeredById);
    batch.set(regRef, {
        ...reg,
        registeredAt: new Date()
    });
  });
  console.log('Initial registrations queued for seeding.');

  // Seed Streams
  const streamsCol = db.collection('streams');
  streamData.forEach(s => {
      const docRef = streamsCol.doc(s.id);
      batch.set(docRef, s);
  });
  console.log('Streams queued for seeding.');

  // Clean up old leaderboard collection
  try {
    const oldLeaderboardSnapshot = await db.collection('leaderboard').get();
    oldLeaderboardSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    console.log('Old leaderboard collection queued for deletion.');
  } catch (error) {
    console.log('Old leaderboard collection not found, skipping deletion.');
  }


  try {
    await batch.commit();
    console.log('Database seeded successfully!');
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, message: 'Error seeding database.' };
  }
}
