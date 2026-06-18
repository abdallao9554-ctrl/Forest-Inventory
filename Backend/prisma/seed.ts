import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.tree.deleteMany();
    await prisma.plot.deleteMany();
    await prisma.compartment.deleteMany();
    await prisma.permit.deleteMany();
    await prisma.user.deleteMany();

    // Create Admin
    await prisma.user.create({
        data: {
            email: 'admin@forest.go.tz',
            name: 'Meneja Mkuu',
            password: 'password123', // In a real app, hash this!
            role: 'ADMIN',
        },
    });

    // Create Second Admin
    await prisma.user.create({
        data: {
            email: 'admin2@forest.go.tz',
            name: 'Meneja Msaidizi',
            password: 'password123', // In a real app, hash this!
            role: 'ADMIN',
        },
    });

    // Create Compartments
    const c1 = await prisma.compartment.create({
        data: {
            name: 'C-101',
            forestName: 'North Forest',
            areaHa: 25.5,
            protectionStatus: 'COMMERCIAL',
            dominantSpecies: 'Pine',
            geoJson: JSON.stringify({ type: 'Polygon', coordinates: [[[-1.29, 36.82], [-1.28, 36.82], [-1.28, 36.83], [-1.29, 36.83], [-1.29, 36.82]]] }),
        },
    });

    const c2 = await prisma.compartment.create({
        data: {
            name: 'C-102',
            forestName: 'North Forest',
            areaHa: 12.0,
            protectionStatus: 'PROTECTED',
            dominantSpecies: 'Indigenous',
            geoJson: JSON.stringify({ type: 'Polygon', coordinates: [[[-1.30, 36.82], [-1.29, 36.82], [-1.29, 36.83], [-1.30, 36.83], [-1.30, 36.82]]] }),
        },
    });

    // Create Plots
    const p1 = await prisma.plot.create({
        data: {
            compartmentId: c1.id,
            plotNumber: 'P-01',
            surveyDate: new Date('2023-10-15'),
            radius: 15,
            geoJson: JSON.stringify({ type: 'Point', coordinates: [-1.285, 36.825] }),
        },
    });

    // Create Trees
    await prisma.tree.create({
        data: {
            plotId: p1.id,
            speciesCode: 'PINE',
            dbh: 45,
            height: 15,
            volume: 1.2,
            status: 'ALIVE',
            geoJson: JSON.stringify({ type: 'Point', coordinates: [-1.2851, 36.8251] }),
        },
    });

    // Create Permits
    await prisma.permit.create({
        data: {
            permitNumber: 'PER-2023-001',
            applicant: 'Mbao Traders Ltd',
            areaHa: 5.5,
            treeCount: 150,
            status: 'APPROVED',
            issueDate: new Date('2023-11-01'),
            expiryDate: new Date('2024-11-01'),
        },
    });

    console.log('Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
