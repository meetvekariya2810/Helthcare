const Department = require('../../models/hrms/Department');
const Designation = require('../../models/hrms/Designation');
const Employee = require('../../models/hrms/Employee');
const { recordAudit } = require('../../middleware/audit');

// GET /api/hrms/organization/departments
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    
    // Add real employee counts
    const counts = await Employee.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: '$departmentName', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id] = c.count; });

    const departmentsWithCounts = departments.map(d => ({
      ...d.toObject(),
      employeeCount: countMap[d.name] || 0
    }));

    res.json({ success: true, departments: departmentsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/organization/departments
const createDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    await recordAudit({
      req,
      action: 'DEPARTMENT_CREATED',
      module: 'ORGANIZATION',
      recordId: dept._id,
      details: `Created department ${dept.name} (${dept.code})`
    });
    res.status(201).json({ success: true, department: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/hrms/organization/designations
const getDesignations = async (req, res) => {
  try {
    const { department } = req.query;
    const query = { isActive: true };
    if (department) query.departmentName = department;

    const designations = await Designation.find(query).sort({ level: 1, title: 1 });
    res.json({ success: true, designations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/organization/designations
const createDesignation = async (req, res) => {
  try {
    const desig = await Designation.create(req.body);
    await recordAudit({
      req,
      action: 'DESIGNATION_CREATED',
      module: 'ORGANIZATION',
      recordId: desig._id,
      details: `Created designation ${desig.title} (${desig.code})`
    });
    res.status(201).json({ success: true, designation: desig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/hrms/organization/hierarchy
const getHierarchyTree = async (req, res) => {
  try {
    const facilities = [
      'BJK Unit 1 - Formulations Facility',
      'BJK Unit 2 - API Manufacturing Facility',
      'BJK Unit 3 - R&D Center of Excellence',
      'BJK Corporate Headquarters',
      'BJK Central Warehouse & Logistics Hub'
    ];

    const departments = await Department.find({ isActive: true });
    const employees = await Employee.find({ status: 'ACTIVE' }, 'fullName employeeId designationTitle departmentName facility');

    const tree = {
      name: 'BJK Healthcare Digital Brain',
      type: 'COMPANY',
      children: facilities.map(fac => {
        const facDepts = departments.filter(d => d.facility === fac);
        return {
          name: fac,
          type: 'FACILITY',
          children: facDepts.map(dept => {
            const deptEmps = employees.filter(e => e.departmentName === dept.name && e.facility === fac);
            return {
              name: dept.name,
              code: dept.code,
              type: 'DEPARTMENT',
              count: deptEmps.length,
              children: deptEmps.slice(0, 10).map(emp => ({
                name: emp.fullName,
                code: emp.employeeId,
                title: emp.designationTitle,
                type: 'EMPLOYEE'
              }))
            };
          })
        };
      })
    };

    res.json({ success: true, tree });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/hrms/organization/departments/:id
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = await Department.findByIdAndUpdate(id, req.body, { new: true });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    
    await recordAudit({
      req,
      action: 'DEPARTMENT_UPDATED',
      module: 'ORGANIZATION',
      recordId: dept._id,
      details: `Updated department ${dept.name}`
    });

    res.json({ success: true, department: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/hrms/organization/departments/:id
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = await Department.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    await recordAudit({
      req,
      action: 'DEPARTMENT_DELETED',
      module: 'ORGANIZATION',
      recordId: dept._id,
      details: `Deactivated department ${dept.name}`
    });

    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/organization/departments/reorder
const reorderDepartments = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (Array.isArray(orderedIds)) {
      for (let i = 0; i < orderedIds.length; i++) {
        await Department.findByIdAndUpdate(orderedIds[i], { order: i });
      }
    }
    res.json({ success: true, message: 'Department order updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/organization/departments/:id/sub-departments
const addSubDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;
    const dept = await Department.findById(id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    dept.subDepartments.push({ name, code: code || name.substring(0, 3).toUpperCase(), description });
    await dept.save();

    res.status(201).json({ success: true, department: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/hrms/organization/departments/:id/sub-departments/:subId
const updateSubDepartment = async (req, res) => {
  try {
    const { id, subId } = req.params;
    const { name, code, description } = req.body;
    const dept = await Department.findById(id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    const sub = dept.subDepartments.id(subId);
    if (!sub) return res.status(404).json({ success: false, message: 'Sub-department not found' });

    if (name) sub.name = name;
    if (code) sub.code = code;
    if (description !== undefined) sub.description = description;

    await dept.save();
    res.json({ success: true, department: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/hrms/organization/departments/:id/sub-departments/:subId
const deleteSubDepartment = async (req, res) => {
  try {
    const { id, subId } = req.params;
    const dept = await Department.findById(id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    dept.subDepartments.pull(subId);
    await dept.save();

    res.json({ success: true, department: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  reorderDepartments,
  addSubDepartment,
  updateSubDepartment,
  deleteSubDepartment,
  getDesignations,
  createDesignation,
  getHierarchyTree
};
