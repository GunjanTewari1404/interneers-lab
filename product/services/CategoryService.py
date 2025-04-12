from ..models.ProductModel import ProductHistory
from ..repository.ProductCategoryRepo import ProductCategoryRepo
from ..repository.ProductRepository import ProductRepository

class CategoryService:
    def __init__(self):
        self.category_repo = ProductCategoryRepo()
        self.product_repo = ProductRepository()
    #service methods which call corr. ProductCategoryRepo methods to perform diff. tasks

    def create_category(self, category_data):
         return self.category_repo.create(category_data)

    def get_all_categories(self):
        return self.category_repo.find_all()

    def get_category_by_id(self,category_id):
        return self.category_repo.find_by_id(category_id)

    def search_categories_by_title(self, title):
        return self.category_repo.search_by_title(title)

    def update_category(self, category_id, category_data):
        return self.category_repo.update(category_id, category_data)

    def delete_category(self, category_id):
        return self.category_repo.delete(category_id)

    def get_products_in_category(self, category_id):
        category=self.category_repo.find_by_id(category_id)
        if not category:
            return []
        return self.product_repo.find_by_category(category)
    
    def add_prod_to_category(self,category_id,product_id):
        category = self.category_repo.find_by_id(category_id)
        product = self.product_repo.get_by_id(product_id)
        if not category or not product:
            return False
        if product.category == category:
            return False
        updated = self.product_repo.update(product_id, {"category": category})
        return updated is not None

    def remove_prod_from_category(self,product_id):
        product = self.product_repo.get_by_id(product_id)
        if not product or not product.category:
            return False
        ProductHistory.create_version(product)
        updated = self.product_repo.update(product_id, {"category": None})
        return updated is not None