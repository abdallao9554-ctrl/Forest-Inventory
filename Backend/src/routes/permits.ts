import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/permits
router.get('/', async (req, res) => {
    try {
        const permits = await prisma.permit.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(permits);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch permits' });
    }
});

// GET /api/permits/:id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const permit = await prisma.permit.findUnique({
            where: { id },
        });
        if (!permit) {
            return res.status(404).json({ error: 'Permit not found' });
        }
        res.json(permit);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch permit' });
    }
});

// POST /api/permits
router.post('/', async (req, res) => {
    const { applicant, areaHa, treeCount, treeIds } = req.body;
    try {
        const permitNumber = `PER-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        const permit = await prisma.permit.create({
            data: {
                permitNumber,
                applicant,
                areaHa: parseFloat(areaHa) || 0,
                treeCount: parseInt(treeCount) || 0,
                status: 'PENDING',
                treeIds: treeIds ? treeIds.join(',') : null,
            },
        });
        res.status(201).json(permit);
    } catch (error) {
        console.error('Create permit error', error);
        res.status(500).json({ error: 'Failed to create permit' });
    }
});

// PATCH /api/permits/:id/status
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updateData: any = { status };

        if (status === 'APPROVED') {
            updateData.issueDate = new Date();
            updateData.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
        }

        const permit = await prisma.permit.update({
            where: { id },
            data: updateData,
        });
        res.json(permit);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update permit status' });
    }
});

export default router;
