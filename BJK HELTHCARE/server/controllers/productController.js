const { Product, ProductCategory, AuditLog } = require('../models');

// @desc    Get all products with search, pagination, category & dosage filtering
// @route   GET /api/products
// @access  Public / Authenticated
const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { search, category, dosageForm, verificationStatus, isActive, sortBy, order } = req.query;

    const query = {};

    // Category filter
    if (category) {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // Dosage Form filter
    if (dosageForm) {
      query.dosageForm = { $regex: new RegExp(dosageForm.trim(), 'i') };
    }

    // Verification Status filter
    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }

    // Active status filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search term in productName, genericName, composition, description, srNo
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const numSearch = parseInt(searchTerm);
      
      const searchConditions = [
        { productName: { $regex: searchTerm, $options: 'i' } },
        { genericName: { $regex: searchTerm, $options: 'i' } },
        { composition: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];

      if (!isNaN(numSearch)) {
        searchConditions.push({ srNo: numSearch });
      }

      query.$or = searchConditions;
    }

    // Sorting options
    let sortOption = { srNo: 1 };
    if (sortBy) {
      const sortOrder = order === 'desc' ? -1 : 1;
      sortOption = { [sortBy]: sortOrder };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all 11 product categories with live product count
// @route   GET /api/products/categories
// @access  Public / Authenticated
const getProductCategories = async (req, res, next) => {
  try {
    const categories = await ProductCategory.find({ isActive: true }).sort({ code: 1 }).lean();
    
    // Update live counts dynamically
    const categoriesWithLiveCount = await Promise.all(
      categories.map(async (cat) => {
        const liveCount = await Product.countDocuments({ category: cat.name });
        return {
          ...cat,
          productCount: liveCount
        };
      })
    );

    res.json({
      success: true,
      count: categoriesWithLiveCount.length,
      data: categoriesWithLiveCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or srNo
// @route   GET /api/products/:id
// @access  Public / Authenticated
const getProductById = async (req, res, next) => {
  try {
    const param = req.params.id;
    let product = null;

    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(param);
    }

    if (!product && !isNaN(parseInt(param))) {
      product = await Product.findOne({ srNo: parseInt(param) });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with ID or Serial Number [${param}]`
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new Product (Prevent Duplicate srNo)
// @route   POST /api/products
// @access  Protected (RBAC: PRODUCT_CREATE / SUPER_ADMIN)
const createProduct = async (req, res, next) => {
  try {
    const { srNo, productName, genericName, dosageForm, category } = req.body;

    // Check duplicate srNo
    if (srNo) {
      const existingSrNo = await Product.findOne({ srNo });
      if (existingSrNo) {
        return res.status(409).json({
          success: false,
          message: `Product with Serial Number [${srNo}] already exists (${existingSrNo.productName}). Duplicate srNo is prevented.`
        });
      }
    } else {
      // Auto-assign next srNo if missing
      const lastProduct = await Product.findOne().sort({ srNo: -1 });
      req.body.srNo = lastProduct ? lastProduct.srNo + 1 : 1;
    }

    const product = await Product.create(req.body);

    await AuditLog.logAction({
      user: req.user,
      action: 'CREATE',
      module: 'PRODUCT',
      resource: 'Product',
      resourceId: product._id,
      newData: product,
      details: `Created new product SR #${product.srNo}: ${product.productName}`
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Product
// @route   PUT /api/products/:id, PATCH /api/products/:id
// @access  Protected (RBAC: PRODUCT_UPDATE / SUPER_ADMIN)
const updateProduct = async (req, res, next) => {
  try {
    const param = req.params.id;
    let product = await Product.findById(param);

    if (!product && !isNaN(parseInt(param))) {
      product = await Product.findOne({ srNo: parseInt(param) });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const oldData = product.toObject();
    Object.assign(product, req.body);
    await product.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'UPDATE',
      module: 'PRODUCT',
      resource: 'Product',
      resourceId: product._id,
      oldData,
      newData: product,
      details: `Updated product SR #${product.srNo}: ${product.productName}`
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / Deactivate Product
// @route   DELETE /api/products/:id
// @access  Protected (RBAC: PRODUCT_DELETE / SUPER_ADMIN)
const deleteProduct = async (req, res, next) => {
  try {
    const param = req.params.id;
    let product = await Product.findById(param);

    if (!product && !isNaN(parseInt(param))) {
      product = await Product.findOne({ srNo: parseInt(param) });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.isActive = false;
    await product.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'DELETE',
      module: 'PRODUCT',
      resource: 'Product',
      resourceId: product._id,
      details: `Deactivated product SR #${product.srNo}: ${product.productName}`
    });

    res.json({
      success: true,
      message: `Product SR #${product.srNo} deactivated successfully`,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
