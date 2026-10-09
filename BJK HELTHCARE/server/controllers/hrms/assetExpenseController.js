const Asset = require('../../models/hrms/Asset');
const Expense = require('../../models/hrms/Expense');
const Employee = require('../../models/hrms/Employee');
const { recordAudit } = require('../../middleware/audit');

// --- ASSETS ---
const getAssets = async (req, res) => {
  try {
    const { category, status } = req.query;
    const query = {};
    if (category && category !== 'ALL') query.category = category;
    if (status && status !== 'ALL') query.status = status;

    const assets = await Asset.find(query).sort({ assetTag: 1 });
    res.json({ success: true, assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const assignAsset = async (req, res) => {
  try {
    const { assetId, employeeId } = req.body;
    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    asset.assignedTo = employee._id;
    asset.assignedEmployeeName = employee.fullName;
    asset.assignedDate = new Date();
    asset.status = 'ASSIGNED';
    await asset.save();

    await recordAudit({
      req,
      action: 'ASSET_ASSIGNED',
      module: 'ASSETS',
      recordId: asset._id,
      details: `Assigned asset ${asset.assetTag} (${asset.name}) to ${employee.fullName}`
    });

    res.json({ success: true, message: 'Asset assigned successfully', asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAsset = async (req, res) => {
  try {
    const { name, category, modelNumber, serialNumber, purchaseCost, warrantyExpiry } = req.body;
    const count = await Asset.countDocuments({});
    const assetTag = req.body.assetTag || `BJK-AST-${String(count + 101).padStart(4, '0')}`;

    const asset = await Asset.create({
      assetTag,
      name,
      category,
      modelNumber: modelNumber || '',
      serialNumber: serialNumber || '',
      purchaseCost: purchaseCost || 0,
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      status: 'AVAILABLE',
      condition: 'EXCELLENT'
    });

    await recordAudit({
      req,
      action: 'ASSET_CREATED',
      module: 'ASSETS',
      recordId: asset._id,
      details: `Registered enterprise asset ${asset.assetTag} (${asset.name})`
    });

    res.status(201).json({ success: true, asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const returnAsset = async (req, res) => {
  try {
    const { assetId, condition = 'GOOD', remarks } = req.body;
    const asset = await Asset.findById(assetId || req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const prevUser = asset.assignedEmployeeName;
    asset.assignedTo = null;
    asset.assignedEmployeeName = '';
    asset.returnDate = new Date();
    asset.condition = condition;
    asset.status = condition === 'DAMAGED' ? 'IN_REPAIR' : 'AVAILABLE';
    await asset.save();

    await recordAudit({
      req,
      action: 'ASSET_RETURNED',
      module: 'ASSETS',
      recordId: asset._id,
      details: `Asset ${asset.assetTag} returned by ${prevUser}. Condition: ${condition}`
    });

    res.json({ success: true, message: 'Asset returned successfully', asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- EXPENSES ---
const getExpenses = async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (employeeId) query.employeeId = employeeId;

    const expenses = await Expense.find(query).sort({ expenseDate: -1 });
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createExpenseClaim = async (req, res) => {
  try {
    const { employeeId, category, title, description, expenseDate, amount } = req.body;
    const targetEmpId = employeeId || req.user.employeeId;
    const emp = await Employee.findOne({ employeeId: targetEmpId });
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

    const count = await Expense.countDocuments({});
    const claimNumber = `BJK-EXP-${String(count + 101).padStart(4, '0')}`;

    const expense = await Expense.create({
      claimNumber,
      employee: emp._id,
      employeeId: emp.employeeId,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      category,
      title,
      description,
      expenseDate: new Date(expenseDate),
      amount,
      status: 'SUBMITTED'
    });

    await recordAudit({
      req,
      action: 'EXPENSE_SUBMITTED',
      module: 'EXPENSES',
      recordId: expense._id,
      details: `${emp.fullName} filed expense claim ${claimNumber} for Rs. ${amount}`
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateExpenseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    expense.status = status;
    expense.approvedBy = req.user ? req.user.name : 'Finance Admin';
    expense.approvedAt = new Date();
    await expense.save();

    await recordAudit({
      req,
      action: `EXPENSE_${status}`,
      module: 'EXPENSES',
      recordId: expense._id,
      details: `Expense claim ${expense.claimNumber} updated to ${status}`
    });

    res.json({ success: true, message: `Expense status updated to ${status}`, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAssets,
  createAsset,
  assignAsset,
  returnAsset,
  getExpenses,
  createExpenseClaim,
  updateExpenseStatus
};
