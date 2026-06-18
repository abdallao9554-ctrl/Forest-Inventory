import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/inventory/compartments
router.get('/compartments', async (req, res) => {
    try {
        const compartments = await prisma.compartment.findMany();
        res.json(compartments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch compartments' });
    }
});

// GET /api/inventory/plots
router.get('/plots', async (req, res) => {
    const { compartmentId } = req.query;
    try {
        const plots = await prisma.plot.findMany({
            where: compartmentId ? { compartmentId: String(compartmentId) } : {},
        });
        res.json(plots);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch plots' });
    }
});

// GET /api/inventory/trees
router.get('/trees', async (req, res) => {
    const { plotId } = req.query;
    try {
        const trees = await prisma.tree.findMany({
            where: plotId ? { plotId: String(plotId) } : {},
        });
        res.json(trees);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trees' });
    }
});

export default router;
