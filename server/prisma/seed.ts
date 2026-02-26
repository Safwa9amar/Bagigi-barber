import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const pairs = [
    {
      admin: {
        name: 'Admin One',
        email: 'admin1@bagigibarber.com',
        phone: '0000000001',
        password: 'password123',
        logoUri: '/uploads/HaircutBeard.png',

      },
      user: {
        name: 'User One',
        email: 'user1@bagigibarber.com',
        phone: '0674020241',
        password: '123123123',
      },
    },
    {
      admin: {
        name: 'Admin Two',
        email: 'admin2@bagigibarber.com',
        phone: '0000000002',
        password: 'password123',
        logoUri: '/uploads/HaircutBeard.png',
      },
      user: {
        name: 'User Two',
        email: 'user2@bagigibarber.com',
        phone: '0674020242',
        password: '123123123',
      },
    },
    {
      admin: {
        name: 'Admin Three',
        email: 'admin3@bagigibarber.com',
        phone: '0000000003',
        password: 'password123',
        logoUri: '/uploads/vip-banner.jpg',
      },
      user: {
        name: 'User Three',
        email: 'user3@bagigibarber.com',
        phone: '0674020243',
        password: '123123123',
      },
    },
  ] as const;

  const superAdminPassword = await bcrypt.hash('password123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@bagigibarber.com' },
    update: {
      name: 'Super Admin',
      phone: '0000000999',
      password: superAdminPassword,
      role: 'ADMIN',
      verified: true,
      emailConfirmed: true,
    },
    create: {
      name: 'Super Admin',
      email: 'superadmin@bagigibarber.com',
      phone: '0000000999',
      password: superAdminPassword,
      role: 'ADMIN',
      verified: true,
      emailConfirmed: true,
    },
  });
  console.log('Ensured super admin uploader:', superAdmin.email);

  const seededPairs: Array<{ adminUserId: string; userId: string }> = [];

  for (let i = 0; i < pairs.length; i += 1) {
    const pair = pairs[i];
    const adminHashedPassword = await bcrypt.hash(pair.admin.password, 10);
    const admin = await prisma.user.upsert({
      where: { email: pair.admin.email },
      update: {
        name: pair.admin.name,
        phone: pair.admin.phone,
        password: adminHashedPassword,
        role: 'ADMIN',
        verified: true,
        emailConfirmed: true,
      },
      create: {
        name: pair.admin.name,
        email: pair.admin.email,
        phone: pair.admin.phone,
        password: adminHashedPassword,
        role: 'ADMIN',
        verified: true,
        emailConfirmed: true,
      },
    });
    console.log('Ensured admin user:', admin.email);

    const logoUri = pair.admin.logoUri;
    const existingLogoFile = await prisma.file.findFirst({
      where: {
        url: logoUri,
        uploadedById: superAdmin.id,
      },
      select: { id: true },
    });

    const logoFile =
      existingLogoFile ??
      (await prisma.file.create({
        data: {
          url: logoUri,
          uri: logoUri,
          originalName: logoUri.split('/').pop() || null,
          mimeType: logoUri.toLowerCase().endsWith('.jpg') || logoUri.toLowerCase().endsWith('.jpeg')
            ? 'image/jpeg'
            : 'image/png',
          uploadedById: superAdmin.id,
        },
        select: { id: true },
      }));

    const adminCode = `ADM${String(i + 1).padStart(3, '0')}`;
    const adminProfile = await prisma.admin.upsert({
      where: { userId: admin.id },
      update: {
        code: adminCode,
        name: pair.admin.name,
        barberLogo: logoUri,
        barberLogoUri: logoUri,
        barberLogoFileId: logoFile.id,
      },
      create: {
        userId: admin.id,
        code: adminCode,
        name: pair.admin.name,
        barberLogo: logoUri,
        barberLogoUri: logoUri,
        barberLogoFileId: logoFile.id,
      },
    });
    console.log('Ensured admin profile:', adminCode);

    const userHashedPassword = await bcrypt.hash(pair.user.password, 10);
    const user = await prisma.user.upsert({
      where: { email: pair.user.email },
      update: {
        adminId: adminProfile.id,
        name: pair.user.name,
        phone: pair.user.phone,
        password: userHashedPassword,
        role: 'USER',
        verified: true,
        emailConfirmed: true,
      },
      create: {
        adminId: adminProfile.id,
        name: pair.user.name,
        email: pair.user.email,
        phone: pair.user.phone,
        password: userHashedPassword,
        role: 'USER',
        verified: true,
        emailConfirmed: true,
      },
    });
    console.log('Ensured user:', pair.user.email);
    seededPairs.push({
      adminUserId: admin.id,
      userId: user.id,
    });
  }

  // 1.5 Create Working Days for Admin (if not exists)
  // Default: Open everyday from 09:00 to 18:00
  for (const pair of seededPairs) {
    const existingWorkingDays = await prisma.workingDay.findMany({
      where: { userId: pair.adminUserId },
    });

    if (existingWorkingDays.length === 0) {
      const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
      await prisma.workingDay.createMany({
        data: days.map(day => ({
          userId: pair.adminUserId,
          day,
          startTime: '09:00',
          endTime: '18:00',
          isOpen: true, // Assuming open every day for simplicity of seed
        })),
      });
      console.log('Seeded working days for admin:', pair.adminUserId);
    }
  }

  const baseServices = [
    {
      category: 'Coiffure',
      name: 'Brushing',
      description: 'Coiffage professionnel avec brushing 3D',
      priceFrom: 300,
      priceTo: 600,
      duration: 30,
      image: '/uploads/Hair-Styling.png',
    },
    {
      category: 'Traitement Capillaire',
      name: 'Traitement à la Protéine',
      description: 'Traitement fortifiant des cheveux à base de protéine',
      priceFrom: 2500,
      duration: 60,
      image: '/uploads/Protein-treatment.png',
    },
    {
      category: 'Traitement Capillaire',
      name: 'Traitement à la Kératine',
      description: 'Traitement lissant à la kératine',
      priceFrom: 2500,
      duration: 90,
      image: '/uploads/KeratinTreatment.png',
    },
    {
      category: 'Soins du Visage',
      name: 'Soin du Visage',
      description: 'Soin profond et complet du visage',
      priceFrom: 1000,
      duration: 45,
      image: '/uploads/Facial-Care.png',
    },
    {
      category: 'Soins du Visage',
      name: 'Nettoyage de la Peau',
      description: 'Nettoyage professionnel de la peau',
      priceFrom: 2000,
      duration: 50,
      image: '/uploads/skin-cleaning.png',
    },
    {
      category: 'Coloration Capillaire',
      name: 'Coloration des Cheveux (Agiva)',
      description: 'Coloration des cheveux avec les produits Agiva',
      priceFrom: 800,
      duration: 40,
      image: '/uploads/Hair-Coloring.png',
    },
    {
      category: 'Coloration Capillaire',
      name: 'Coloration Toppik',
      description: 'Coloration des cheveux avec fibres Toppik',
      priceFrom: 800,
      duration: 30,
      image: '/uploads/Hair-Coloring.png',
    },
    {
      category: 'Soins Capillaires',
      name: 'Shampooing Colorant',
      description: 'Service de shampooing colorant',
      priceFrom: 500,
      duration: 20,
      image: '/uploads/Shampoo-Coloring.png',
    },
    {
      category: 'Coupe de Cheveux',
      name: 'Coupe Homme',
      description: 'Coupe classique pour homme',
      priceFrom: 500,
      duration: 25,
      image: '/uploads/classic-haircut.png',
    },
    {
      category: 'Coupe de Cheveux',
      name: 'Coupe Enfant',
      description: 'Coupe de cheveux pour enfants',
      priceFrom: 300,
      duration: 20,
      image: '/uploads/kids-haircut.png',
    },
    {
      category: 'Coupe de Cheveux',
      name: 'Contour des Oreilles',
      description: 'Contour des cheveux autour des oreilles',
      priceFrom: 200,
      duration: 10,
      image: '/uploads/EarContour.png',
    },
    {
      category: 'Coupe & Barbe',
      name: 'Contour + Barbe',
      description: 'Contour des oreilles avec taille de la barbe',
      priceFrom: 400,
      duration: 20,
      image: '/uploads/HaircutBeard.png',
    },
    {
      category: 'VIP',
      name: 'Coupe VIP',
      description: 'Expérience premium de coupe VIP',
      priceFrom: 1000,
      duration: 45,
      is_vip: true,
      image: '/uploads/vip-banner.jpg',
    },
    {
      category: 'Service à Domicile',
      name: 'Coupe à Domicile',
      description: 'Coupe de cheveux au domicile du client',
      priceFrom: 2000,
      duration: 60,
      image: '/uploads/HomeHaircut.png',
    },
  ] as const;

  // 3. Create one demo service + one booking per admin/user pair
  let createdBaseServices = 0;
  for (let i = 0; i < seededPairs.length; i += 1) {
    const pair = seededPairs[i];

    for (const service of baseServices) {
      const existingService = await prisma.service.findFirst({
        where: { userId: pair.adminUserId, name: service.name },
      });

      if (!existingService) {
        await prisma.service.create({
          data: {
            ...service,
            userId: pair.adminUserId,
          },
        });
        createdBaseServices += 1;
      }
    }

    const demoServiceName = `Demo Service Admin ${i + 1}`;
    const existingDemoService = await prisma.service.findFirst({
      where: { userId: pair.adminUserId, name: demoServiceName },
    });
    const demoService =
      existingDemoService ??
      (await prisma.service.create({
        data: {
          category: 'Demo',
          name: demoServiceName,
          description: 'Demo service for seeded admin-client scoping',
          priceFrom: 500 + i * 100,
          duration: 30,
          userId: pair.adminUserId,
        },
      }));

    const existingDemoBooking = await prisma.booking.findFirst({
      where: {
        userId: pair.userId,
        serviceId: demoService.id,
      },
    });

    if (!existingDemoBooking) {
      const estimatedAt = new Date(Date.now() + (i + 1) * 15 * 60 * 1000);
      await prisma.booking.create({
        data: {
          userId: pair.userId,
          serviceId: demoService.id,
          duration: demoService.duration,
          position: i + 1,
          status: 'PENDING',
          estimatedAt,
        },
      });
    }
  }

  console.log(`Seeded/verified ${pairs.length} admins, ${pairs.length} users`);
  console.log(`Created ${createdBaseServices} base services across admins`);
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
