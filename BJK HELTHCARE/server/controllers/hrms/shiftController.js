const Shift = require('../../models/hrms/Shift');
const { recordAudit } = require('../../middleware/audit');

// GET /api/hrms/shifts
const getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, shifts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/shifts
const createShift = async (req, res) => {
  try {
    const shift = await Shift.create(req.body);
    await recordAudit({
      req,
      action: 'SHIFT_CREATED',
      module: 'SHIFTS',
      recordId: shift._id,
      details: `Created shift ${shift.name} (${shift.startTime} - ${shift.endTime})`
    });
    res.status(201).json({ success: true, shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/hrms/shifts/:id
const updateShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await recordAudit({
      req,
      action: 'SHIFT_UPDATED',
      module: 'SHIFTS',
      recordId: shift._id,
      details: `Updated shift ${shift.name}`
    });
    res.json({ success: true, shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getShifts, createShift, updateShift };
