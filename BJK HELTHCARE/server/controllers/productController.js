/**
 * BJK HEALTHCARE — PRODUCT CONTROLLER (PURE SQL)
 * 100% Parameterized PostgreSQL operations via productRepo and auditRepo.
 * Zero Mongoose / MongoDB runtime dependency.
 */

const { productRepo, auditRepo } = require('../repositories');

// @desc    Get all products with search, pagination, category & dosage filtering
// @route   GET /api/products
// @access  Public / Authenticated
const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 20));
    const { search, category, sortBy, order, isActive } = req.query;

    const result = await productRepo.listProducts({
      page,
      limit,
      category,
      search,
      activeOnly: isActive !== 'false',
      sortBy,
      order
    });

    res.json({
      success: true,
      count: result.data.length,
      total: result.pagination.total,
      page: result.pagination.page,
      pages: result.pagination.totalPages,
      data: result.data
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
    const categories = await productRepo.getProductCategories();
    res.json({
      success: true,
      count: categories.length,
      data: categories
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
    const product = await productRepo.findBySrNoOrId(param);

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

// @desc    Create new Product
// @route   POST /api/products
// @access  Protected (RBAC: PRODUCT_CREATE / SUPER_ADMIN)
const createProduct = async (req, res, next) => {
  try {
    const { productCode, productName, genericName, dosageForm, category } = req.body;

    if (productCode) {
      const existing = await productRepo.findByProductCode(productCode);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Product with code [${productCode}] already exists. Duplicate code prevented.`
        });
      }
    }

    const product = await productRepo.createProduct(req.body);

    await auditRepo.log({
      actorId: req.user?.id,
      actorName: req.user?.name || 'Authorized Operator',
      actorRole: req.user?.role || 'OPERATOR',
      action: 'CREATE',
      entityType: 'PRODUCT',
      entityId: product.id,
      newState: product
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
    const oldProduct = await productRepo.findBySrNoOrId(param);

    if (!oldProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updated = await productRepo.updateProduct(oldProduct.id, req.body);

    await auditRepo.log({
      actorId: req.user?.id,
      actorName: req.user?.name || 'Authorized Operator',
      actorRole: req.user?.role || 'OPERATOR',
      action: 'UPDATE',
      entityType: 'PRODUCT',
      entityId: oldProduct.id,
      previousState: oldProduct,
      newState: updated
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated
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
    const product = await productRepo.findBySrNoOrId(param);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const deactivated = await productRepo.updateProduct(product.id, { isActive: false });

    await auditRepo.log({
      actorId: req.user?.id,
      actorName: req.user?.name || 'Authorized Operator',
      actorRole: req.user?.role || 'OPERATOR',
      action: 'DELETE',
      entityType: 'PRODUCT',
      entityId: product.id,
      previousState: product,
      newState: deactivated
    });

    res.json({
      success: true,
      message: `Product [${product.product_code || product.name}] deactivated successfully`,
      data: deactivated
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
