const { FileDB } = require('../utils/fileDb');

const userDB = new FileDB('users.json');

const getMechanics = async (req, res) => {
  try {
    const mechanics = userDB.find({ isMechanic: true });
    const mechanicsWithoutPassword = mechanics.map(({ password, ...rest }) => rest);
    res.json(mechanicsWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMechanicById = async (req, res) => {
  try {
    const mechanic = userDB.findById(req.params.id);

    if (mechanic && mechanic.isMechanic) {
      const { password, ...mechanicWithoutPassword } = mechanic;
      res.json(mechanicWithoutPassword);
    } else {
      res.status(404).json({ message: 'Mechanic not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateMechanicProfile = async (req, res) => {
  try {
    const mechanic = userDB.findById(req.user._id);

    if (mechanic && mechanic.isMechanic) {
      const updates = {
        name: req.body.name || mechanic.name,
        email: req.body.email || mechanic.email,
        phone: req.body.phone || mechanic.phone,
        address: req.body.address || mechanic.address,
      };

      const updatedMechanic = userDB.update(req.user._id, updates);

      res.json({
        _id: updatedMechanic._id,
        name: updatedMechanic.name,
        email: updatedMechanic.email,
        phone: updatedMechanic.phone,
        address: updatedMechanic.address,
        isMechanic: updatedMechanic.isMechanic,
      });
    } else {
      res.status(404).json({ message: 'Mechanic not found or not authorized' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMechanics,
  getMechanicById,
  updateMechanicProfile,
};
