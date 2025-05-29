import express, { Request, Response } from 'express';
import { PrismaClient, Prisma } from '../prisma/generated/client';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to database');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
}

interface ContactRequest {
  email?: string;
  phoneNumber?: string;
}

app.post('/identify', async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber }: ContactRequest = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Either email or phoneNumber is required' });
    }

    // Find all contacts with matching email or phone
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { email: email || undefined },
          { phoneNumber: phoneNumber || undefined }
        ],
        deletedAt: null
      }
    });

    // If no contacts, create a new primary
    if (contacts.length === 0) {
      const newContact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: 'primary'
        }
      });
      return res.json({ contacts: [newContact] });
    }

    // Find the primary (oldest) contact
    const primary = contacts.reduce((a, b) => (a.createdAt < b.createdAt ? a : b));

    // Update all other primaries in the group to secondary
    await Promise.all(
      contacts
        .filter(c => c.id !== primary.id && c.linkPrecedence === 'primary')
        .map(c =>
          prisma.contact.update({
            where: { id: c.id },
            data: { linkPrecedence: 'secondary', linkedId: primary.id }
          })
        )
    );

    // Check if the exact (email, phone) combo exists
    const exact = contacts.find(
      c => c.email === email && c.phoneNumber === phoneNumber
    );

    if (!exact) {
      // Create a new secondary contact
      await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: 'secondary',
          linkedId: primary.id
        }
      });
    }

    // Return all contacts for this group
    const all = await prisma.contact.findMany({
      where: {
        OR: [
          { id: primary.id },
          { linkedId: primary.id }
        ],
        deletedAt: null
      }
    });

    res.json({ contacts: all });
  } catch (error) {
    console.error('Error in /identify endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello World' });
});

// Initialize server
async function startServer() {
  await testConnection();
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});