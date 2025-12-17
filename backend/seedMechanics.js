const bcrypt = require('bcryptjs');
const { FileDB } = require('./utils/fileDb');

const userDB = new FileDB('users.json');

async function seedMechanics() {
  console.log('🔧 Seeding mechanics data...');

  const mechanics = [
    {
      name: 'Ahmed Hassan',
      email: 'ahmed.mechanic@orva.com',
      password: 'mechanic123',
      phone: '01012345678',
      nationalId: 'M001234567',
      address: 'Cairo, Nasr City',
      age: 35,
      vehicleType: 'All Types',
      isMechanic: true,
      isAdmin: false,
      photo: '',
      description: 'Expert in engine diagnostics and repair. 15+ years of experience with all vehicle types.',
      specialties: ['Engine Repair', 'Transmission', 'Electrical Systems']
    },
    {
      name: 'Mohamed Ali',
      email: 'mohamed.mechanic@orva.com',
      password: 'mechanic123',
      phone: '01098765432',
      nationalId: 'M002345678',
      address: 'Giza, 6th October',
      age: 42,
      vehicleType: 'All Types',
      isMechanic: true,
      isAdmin: false,
      photo: '',
      description: 'Specialized in luxury and European cars. BMW, Mercedes, Audi certified technician.',
      specialties: ['Luxury Cars', 'AC Systems', 'Brake Systems']
    },
    {
      name: 'Khaled Ibrahim',
      email: 'khaled.mechanic@orva.com',
      password: 'mechanic123',
      phone: '01123456789',
      nationalId: 'M003456789',
      address: 'Alexandria, Smouha',
      age: 28,
      vehicleType: 'All Types',
      isMechanic: true,
      isAdmin: false,
      photo: '',
      description: 'Young and energetic mechanic specializing in modern vehicles and hybrid systems.',
      specialties: ['Hybrid Systems', 'Diagnostics', 'Oil Change']
    },
    {
      name: 'Mahmoud Saeed',
      email: 'mahmoud.mechanic@orva.com',
      password: 'mechanic123',
      phone: '01234567890',
      nationalId: 'M004567890',
      address: 'Cairo, Heliopolis',
      age: 38,
      vehicleType: 'All Types',
      isMechanic: true,
      isAdmin: false,
      photo: '',
      description: 'Expert in suspension and steering systems. Quick and reliable service.',
      specialties: ['Suspension', 'Steering', 'Wheel Alignment']
    },
    {
      name: 'Youssef Adel',
      email: 'youssef.mechanic@orva.com',
      password: 'mechanic123',
      phone: '01156789012',
      nationalId: 'M005678901',
      address: 'Cairo, Maadi',
      age: 31,
      vehicleType: 'All Types',
      isMechanic: true,
      isAdmin: false,
      photo: '',
      description: 'Specialist in bodywork and paint. Makes your car look brand new!',
      specialties: ['Bodywork', 'Paint', 'Dent Removal']
    }
  ];

  try {
    for (const mechanic of mechanics) {
      // Check if mechanic already exists
      const exists = userDB.findOne({ email: mechanic.email });
      
      if (!exists) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mechanic.password, salt);
        
        // Create mechanic
        const newMechanic = userDB.create({
          ...mechanic,
          password: hashedPassword
        });
        
        console.log(`✅ Created mechanic: ${mechanic.name}`);
      } else {
        console.log(`⏭️  Mechanic already exists: ${mechanic.name}`);
      }
    }
    
    console.log('✨ Mechanics seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding mechanics:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedMechanics().then(() => {
    console.log('Done!');
    process.exit(0);
  });
}

module.exports = seedMechanics;
