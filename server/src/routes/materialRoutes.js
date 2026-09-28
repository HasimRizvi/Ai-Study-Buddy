const express = require('express');
const {
  getMaterials,
  getMaterialById,
  createMaterial,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  getSubjects,
} = require('../controllers/materialController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/', getMaterials);
router.get('/subjects', getSubjects);
router.post('/', createMaterial);
router.post('/upload', upload.single('file'), uploadMaterial);
router.get('/:id', getMaterialById);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

module.exports = router;
