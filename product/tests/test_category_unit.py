import unittest
from unittest.mock import Mock, patch
from bson import ObjectId
from ..services.CategoryService import CategoryService
from ..models.CategoryModel import ProductCategory
from ..models.ProductModel import Product, ProductHistory

class TestCategoryService(unittest.TestCase):
    CATEGORY_ID=ObjectId()
    PRODUCT_ID=ObjectId()
    
    def setUp(self):
        self.category_service=CategoryService()                 #create service with mock repo
        self.category_service.category_repo=Mock()            #create mock repo
        self.category_service.product_repo=Mock()
          
        self.sample_categ_data={'title': 'Test Category','description': 'This is a test category'}     #sample categ. data for testing
        self.sample_categ=Mock(spec=ProductCategory)   #sample categ.
        self.sample_categ.id=self.CATEGORY_ID
        self.sample_categ.title='Test Category'
        self.sample_categ.description='This is a test category'
        self.sample_prod=Mock(spec=Product)            #sample prod.
        self.sample_prod.id=self.PRODUCT_ID
        self.sample_prod.name='Test Product'
        self.sample_prod.category=self.sample_categ
    
    def tearDown(self):
        self.category_service.category_repo.reset_mock()
        self.category_service.category_repo=None
        self.category_service=None
        self.sample_categ=None
        self.sample_prod=None
        self.sample_categ_data=None
    
    def test_create_category(self):
        self.category_service.category_repo.create.return_value=self.sample_categ     #configure mock repo to return our sample categ.
        result=self.category_service.create_category(self.sample_categ_data)   #call service method
        self.category_service.category_repo.create.assert_called_once_with(self.sample_categ_data)       #assert repo's create method was called with correct data
        self.assertEqual(result,self.sample_categ)      #assert that result is our sample categ.
    
    def test_get_all_categories(self):
        self.category_service.category_repo.find_all.return_value=[self.sample_categ]
        result=self.category_service.get_all_categories()
        self.category_service.category_repo.find_all.assert_called_once()
        self.assertEqual(result,[self.sample_categ])
    
    def test_get_category_by_id(self):
        self.category_service.category_repo.find_by_id.return_value=self.sample_categ
        result=self.category_service.get_category_by_id(self.CATEGORY_ID)
        self.category_service.category_repo.find_by_id.assert_called_once_with(self.CATEGORY_ID)
        self.assertEqual(result, self.sample_categ)
    
    def test_get_category_by_id_not_found(self):
        self.category_service.category_repo.find_by_id.return_value=None
        result=self.category_service.get_category_by_id('nonexistent_id')
        self.category_service.category_repo.find_by_id.assert_called_once_with('nonexistent_id')
        self.assertIsNone(result)
    
    def test_update_category(self):
        updated_data={'title': 'Updated Category','description': 'This is an updated test category'}
        updated_categ=Mock(spec=ProductCategory)
        updated_categ.title='Updated Category'
        updated_categ.description='This is an updated test category'
        self.category_service.category_repo.update.return_value=updated_categ
        result=self.category_service.update_category(self.CATEGORY_ID,updated_data)
        self.category_service.category_repo.update.assert_called_once_with(self.CATEGORY_ID,updated_data)
        self.assertEqual(result,updated_categ)
    
    def test_update_category_not_found(self):
        updated_data={'title': 'Updated Category','description':'This is an updated category'}
        self.category_service.category_repo.update.return_value=None
        result=self.category_service.update_category('nonexistent_id',updated_data)
        self.category_service.category_repo.update.assert_called_once_with('nonexistent_id',updated_data)
        self.assertIsNone(result)
    
    def test_delete_category(self):
        self.category_service.category_repo.delete.return_value=True
        result=self.category_service.delete_category(self.CATEGORY_ID)
        self.category_service.category_repo.delete.assert_called_once_with(self.CATEGORY_ID)
        self.assertTrue(result)
    
    def test_delete_category_not_found(self):
        self.category_service.category_repo.delete.return_value=False
        result=self.category_service.delete_category('nonexistent_id')
        self.category_service.category_repo.delete.assert_called_once_with('nonexistent_id')
        self.assertFalse(result)
    
    def test_get_products_in_category(self):
        self.category_service.category_repo.find_by_id.return_value = self.sample_categ
        self.category_service.product_repo.find_by_category.return_value = [self.sample_prod]
        result=self.category_service.get_products_in_category(self.CATEGORY_ID)  
        self.assertEqual(result, [self.sample_prod])
    
    def test_get_products_in_category_not_found(self):
        self.category_service.category_repo.find_by_id.return_value=None
        result=self.category_service.get_products_in_category('nonexistent_id')
        self.category_service.category_repo.find_by_id.assert_called_once_with('nonexistent_id')
        self.assertEqual(result, [])
    
    def test_add_prod_to_category(self):
        self.sample_prod.category=None
        self.category_service.category_repo.find_by_id.return_value = self.sample_categ
        self.category_service.product_repo.get_by_id.return_value = self.sample_prod
        self.category_service.product_repo.update.return_value = True
        result=self.category_service.add_prod_to_category(self.CATEGORY_ID,self.PRODUCT_ID)
        self.assertTrue(result)
    
    def test_add_prod_to_category_category_not_found(self):
        self.category_service.category_repo.find_by_id.return_value = None
        self.category_service.product_repo.get_by_id.return_value = self.sample_prod
        result=self.category_service.add_prod_to_category('nonexistent_id',self.PRODUCT_ID)
        self.category_service.category_repo.find_by_id.assert_called_once_with('nonexistent_id')    
        self.assertFalse(result)
    
    def test_add_prod_to_category_product_not_found(self):
        self.category_service.category_repo.find_by_id.return_value = self.sample_categ
        self.category_service.product_repo.get_by_id.return_value = None
        result=self.category_service.add_prod_to_category(self.CATEGORY_ID, 'nonexistent_id')
        self.category_service.product_repo.get_by_id.assert_called_once_with('nonexistent_id')
        self.assertFalse(result)
    
    def test_remove_prod_from_category(self):
        self.sample_prod.category=self.sample_categ
        self.category_service.product_repo.get_by_id.return_value = self.sample_prod
        self.category_service.product_repo.update.return_value = True
        with patch('product.services.CategoryService.ProductHistory') as mock_history:
            result = self.category_service.remove_prod_from_category(self.PRODUCT_ID)
            mock_history.create_version.assert_called_once_with(self.sample_prod)
            self.assertTrue(result)
    
    def test_remove_prod_from_category_no_category(self):
        self.sample_prod.category=None
        self.category_service.product_repo.get_by_id.return_value = self.sample_prod
        result=self.category_service.remove_prod_from_category(self.PRODUCT_ID)
        self.assertFalse(result)
    
    def test_remove_prod_from_category_product_not_found(self):
        self.category_service.product_repo.get_by_id.return_value=None
        result=self.category_service.remove_prod_from_category(self.PRODUCT_ID)
        self.category_service.product_repo.get_by_id.assert_called_once_with(self.PRODUCT_ID)
        self.assertFalse(result)

if __name__ == '__main__':
    unittest.main()