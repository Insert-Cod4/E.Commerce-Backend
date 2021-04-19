const express = require('express')
const router = express.Router()

// middlewares
const { authCheck, adminCheck } = require('../middlewares/auth')

// Controller
const { create, listAll,
    remove, read,
    update, list,
    productCount, productStar,
    listRelated, searchFilters } = require('../controllers/product')

// routes
router.post('/product', authCheck, adminCheck, create);
router.get('/products/total', productCount)

router.get('/products/:count', listAll);
router.delete('/product/:slug', authCheck, adminCheck, remove)
router.get('/product/:slug', read)
router.put('/product/:slug', authCheck, adminCheck, update)
router.post('/products', list)
// ratings
router.put('/product/star/:productId', authCheck, productStar)
// related products
router.get('/product/related/:productId', listRelated);
// Search
router.post('/search/filters', searchFilters)

module.exports = router;

