import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');
    
    // Replace this with the actual Clerk user ID of the admin
    const adminClerkId = process.env.ADMIN_CLERK_ID;
    
    if (!adminClerkId) {
      console.error('Please set ADMIN_CLERK_ID environment variable');
      process.exit(1);
    }

    // Check if admin user already exists
    let adminUser = await prisma.user.findFirst({
      where: { clerkId: adminClerkId }
    });

    if (adminUser) {
      // Update existing user to admin role
      adminUser = await prisma.user.update({
        where: { id: adminUser.id },
        data: { role: 'ADMIN' }
      });
      console.log(`Updated user ${adminUser.email} to admin role`);
    } else {
      // Create new admin user
      adminUser = await prisma.user.create({
        data: {
          clerkId: adminClerkId,
          email: `${adminClerkId}@clerk.admin`,
          name: 'Admin User',
          role: 'ADMIN'
        }
      });
      console.log(`Created admin user with Clerk ID: ${adminClerkId}`);
    }

    console.log('Admin setup completed successfully!');
    console.log('Admin user:', adminUser);
    
  } catch (error) {
    console.error('Error setting up admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();
