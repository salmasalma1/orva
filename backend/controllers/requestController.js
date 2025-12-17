const { FileDB } = require('../utils/fileDb');

const requestDB = new FileDB('requests.json');
const userDB = new FileDB('users.json');

const createRequest = async (req, res) => {
  try {
    const { serviceType, vehicleType, description, location, mechanic } = req.body;

    const request = requestDB.create({
      user: req.user._id,
      mechanic: mechanic || null,
      serviceType,
      vehicleType,
      description,
      location,
      status: 'pending',
      estimatedCost: 0,
      actualCost: 0,
    });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = requestDB.find({ user: req.user._id });
    const sortedRequests = requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const requestsWithUsers = sortedRequests.map(request => {
      const mechanic = request.mechanic ? userDB.findById(request.mechanic) : null;
      return {
        ...request,
        mechanic: mechanic ? { _id: mechanic._id, name: mechanic.name, phone: mechanic.phone, email: mechanic.email } : null
      };
    });

    res.json(requestsWithUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRequestById = async (req, res) => {
  try {
    const request = requestDB.findById(req.params.id);

    if (request) {
      if (
        request.user === req.user._id ||
        (request.mechanic && request.mechanic === req.user._id) ||
        req.user.isAdmin
      ) {
        const user = userDB.findById(request.user);
        const mechanic = request.mechanic ? userDB.findById(request.mechanic) : null;
        
        res.json({
          ...request,
          user: user ? { _id: user._id, name: user.name, phone: user.phone, email: user.email } : null,
          mechanic: mechanic ? { _id: mechanic._id, name: mechanic.name, phone: mechanic.phone, email: mechanic.email } : null
        });
      } else {
        res.status(403).json({ message: 'Not authorized to view this request' });
      }
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { status, estimatedCost, actualCost } = req.body;

    const request = requestDB.findById(req.params.id);

    if (request) {
      if (
        request.user === req.user._id ||
        (request.mechanic && request.mechanic === req.user._id) ||
        req.user.isAdmin
      ) {
        const updates = {
          status: status || request.status
        };
        
        if (estimatedCost !== undefined) {
          updates.estimatedCost = estimatedCost;
        }
        
        if (actualCost !== undefined) {
          updates.actualCost = actualCost;
        }

        if (status === 'completed') {
          updates.completionTime = new Date().toISOString();
        }

        const updatedRequest = requestDB.update(req.params.id, updates);
        res.json(updatedRequest);
      } else {
        res.status(403).json({ message: 'Not authorized to update this request' });
      }
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const request = requestDB.findById(req.params.id);

    if (request) {
      if (
        request.user === req.user._id ||
        req.user.isAdmin
      ) {
        requestDB.delete(req.params.id);
        res.json({ message: 'Request removed' });
      } else {
        res.status(403).json({ message: 'Not authorized to delete this request' });
      }
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMechanicRequests = async (req, res) => {
  try {
    if (!req.user.isMechanic) {
      return res.status(403).json({ message: 'Not authorized as mechanic' });
    }

    const allRequests = requestDB.find({});
    const filteredRequests = allRequests.filter(request => 
      request.mechanic === req.user._id || 
      (request.status === 'pending' && !request.mechanic)
    );

    const sortedRequests = filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const requestsWithUsers = sortedRequests.map(request => {
      const user = userDB.findById(request.user);
      return {
        ...request,
        user: user ? { _id: user._id, name: user.name, phone: user.phone, email: user.email } : null
      };
    });

    res.json(requestsWithUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateRequest = async (req, res) => {
  try {
    const request = requestDB.findById(req.params.id);

    if (request) {
      if (
        (request.mechanic && request.mechanic === req.user._id) ||
        req.user.isAdmin
      ) {
        const updates = {
          mechanic: req.body.mechanic || request.mechanic,
          estimatedCost: req.body.estimatedCost || request.estimatedCost,
          actualCost: req.body.actualCost || request.actualCost,
          status: req.body.status || request.status
        };

        const updatedRequest = requestDB.update(req.params.id, updates);
        res.json(updatedRequest);
      } else {
        res.status(403).json({ message: 'Not authorized to update this request' });
      }
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
  getMechanicRequests,
  updateRequest,
};
