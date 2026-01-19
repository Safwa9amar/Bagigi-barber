import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // 1. Create or find the admin user
  const adminEmail = 'admin@bagigibarber.com';
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        phone: '0000000000',
        role: 'ADMIN',
        verified: true,
        emailConfirmed: true,
      },
    });
    console.log('Created admin user:', admin.id);
  } else {
    console.log('Found admin user:', admin.id);
  }

  const userId = admin.id;

  // 1.5 Create Working Days for Admin (if not exists)
  // Default: Open everyday from 09:00 to 18:00
  const existingWorkingDays = await prisma.workingDay.findMany({
    where: { userId },
  });

  if (existingWorkingDays.length === 0) {
    const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    await prisma.workingDay.createMany({
      data: days.map(day => ({
        userId,
        day,
        startTime: '09:00',
        endTime: '18:00',
        isOpen: true, // Assuming open every day for simplicity of seed
      })),
    });
    console.log('Seeded working days for admin');
  }

  // 2. Upsert services
  // We use deleteMany to clear old services or we can just create if empty.
  // For safety in dev, let's clear existing services (optional, but cleaner for seed)
  await prisma.service.deleteMany();

  const services = await prisma.service.createMany({
    data: [
      {
        category: 'Coiffure',
        name: 'Brushing',
        description: 'Coiffage professionnel avec brushing 3D',
        priceFrom: 300,
        priceTo: 600,
        duration: 30,
        userId: userId,
        image: '/uploads/Hair-Styling.png',
      },
      {
        category: 'Traitement Capillaire',
        name: 'Traitement à la Protéine',
        description: 'Traitement fortifiant des cheveux à base de protéine',
        priceFrom: 2500,
        duration: 60,
        userId: userId,
        image: '/uploads/Protein-treatment.png',
      },
      {
        category: 'Traitement Capillaire',
        name: 'Traitement à la Kératine',
        description: 'Traitement lissant à la kératine',
        priceFrom: 2500,
        duration: 90,
        userId: userId,
        image: '/uploads/KeratinTreatment.png',
      },
      {
        category: 'Soins du Visage',
        name: 'Soin du Visage',
        description: 'Soin profond et complet du visage',
        priceFrom: 1000,
        duration: 45,
        userId: userId,
        image: '/uploads/Facial-Care.png',
      },
      {
        category: 'Soins du Visage',
        name: 'Nettoyage de la Peau',
        description: 'Nettoyage professionnel de la peau',
        priceFrom: 2000,
        duration: 50,
        image: '/uploads/skin-cleaning.png',
        userId: userId,
      },
      {
        category: 'Coloration Capillaire',
        name: 'Coloration des Cheveux (Agiva)',
        description: 'Coloration des cheveux avec les produits Agiva',
        priceFrom: 800,
        duration: 40,
        image: '/uploads/Hair-Coloring.png',
        userId: userId,
      },
      {
        category: 'Coloration Capillaire',
        name: 'Coloration Toppik',
        description: 'Coloration des cheveux avec fibres Toppik',
        priceFrom: 800,
        duration: 30,
        image: '/uploads/Hair-Coloring.png',
        userId: userId,
      },
      {
        category: 'Soins Capillaires',
        name: 'Shampooing Colorant',
        description: 'Service de shampooing colorant',
        priceFrom: 500,
        duration: 20,
        userId: userId,
        image: '/uploads/Shampoo-Coloring.png',
      },
      {
        category: 'Coupe de Cheveux',
        name: 'Coupe Homme',
        description: 'Coupe classique pour homme',
        priceFrom: 500,
        duration: 25,
        userId: userId,
        image: '/uploads/classic-haircut.png',
      },
      {
        category: 'Coupe de Cheveux',
        name: 'Coupe Enfant',
        description: 'Coupe de cheveux pour enfants',
        priceFrom: 300,
        duration: 20,
        userId: userId,
        image: '/uploads/kids-haircut.png',
      },
      {
        category: 'Coupe de Cheveux',
        name: 'Contour des Oreilles',
        description: 'Contour des cheveux autour des oreilles',
        priceFrom: 200,
        duration: 10,
        userId: userId,
        image: '/uploads/EarContour.png',
      },
      {
        category: 'Coupe & Barbe',
        name: 'Contour + Barbe',
        description: 'Contour des oreilles avec taille de la barbe',
        priceFrom: 400,
        duration: 20,
        userId: userId,
        image: '/uploads/HaircutBeard.png',
      },
      {
        category: 'VIP',
        name: 'Coupe VIP',
        description: 'Expérience premium de coupe VIP',
        priceFrom: 1000,
        duration: 45,
        userId: userId,
        is_vip: true,
        image: '/uploads/vip-banner.jpg',
      },
      {
        category: 'Service à Domicile',
        name: 'Coupe à Domicile',
        description: 'Coupe de cheveux au domicile du client',
        priceFrom: 2000,
        userId: userId,
        duration: 60,
        image: '/uploads/HomeHaircut.png',
      },
    ],
  });

  //3 .add new user
  const userhashedPassword = await bcrypt.hash('123123123', 10);

  const user = await prisma.user.create({
    data: {
      name: "test user",
      email: 'user@bagigibarber.com',
      password: userhashedPassword,
      phone: '0674020244',
      role: 'USER',
      verified: true,
      emailConfirmed: true,
    },
  });
  console.log(`Seeded ${services.count} services`);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
