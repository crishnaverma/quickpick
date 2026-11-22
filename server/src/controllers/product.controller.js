const prisma = require('../database/prisma');
const { success, error } = require('../utils/response');

// Helper to safely parse JSON strings or arrays
const parseJsonField = (field, defaultValue = null) => {
  if (!field) return defaultValue;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return defaultValue;
    }
  }
  return field;
};

// Transform product for clean frontend consumption
const formatProduct = (p) => {
  return {
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    costPrice: p.costPrice ? Number(p.costPrice) : null,
    images: parseJsonField(p.images, []),
    variants: parseJsonField(p.variants, null),
    availableStock: Math.max(0, p.stockQuantity - (p.reservedStock || 0)),
  };
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    const formatted = categories.map((c) => ({
      ...c,
      productCount: c._count.products,
    }));

    return success(res, formatted, 'Categories fetched successfully');
  } catch (err) {
    next(err);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      sort = 'featured',
      inStock,
      page = 1,
      limit = 24,
    } = req.query;

    const where = {
      isActive: true,
    };

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (inStock === 'true' || inStock === true) {
      where.stockQuantity = { gt: 0 };
      where.isAvailable = true;
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };
    if (sort === 'name-asc') orderBy = { name: 'asc' };
    if (sort === 'name-desc') orderBy = { name: 'desc' };
    if (sort === 'popular') orderBy = { stockQuantity: 'desc' };

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formattedProducts = products.map(formatProduct);

    return success(res, {
      products: formattedProducts,
      pagination: {
        total: totalCount,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product || !product.isActive) {
      return error(res, 'Product not found', 404);
    }

    // Fetch related products from same category
    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        NOT: { id: product.id },
      },
      take: 4,
    });

    return success(res, {
      product: formatProduct(product),
      relatedProducts: related.map(formatProduct),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  getProducts,
  getProductBySlug,
  formatProduct,
  parseJsonField,
};
