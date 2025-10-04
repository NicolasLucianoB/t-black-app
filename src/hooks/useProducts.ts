import { useCallback, useEffect, useState } from 'react';

import { databaseService } from '../services';
import { Product } from '../types';
import { useApi } from './useApi';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const { loading, error, execute } = useApi<Product[]>();

  const loadProducts = useCallback(async () => {
    await execute(async () => {
      const data = await databaseService.products.getAll();
      setProducts(data);
      return { data, error: null };
    });
  }, [execute]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    refetch: loadProducts,
  };
}

export function useProduct(productId?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const { loading, error, execute } = useApi<Product>();

  const loadProduct = useCallback(async () => {
    if (!productId) return;

    await execute(async () => {
      const data = await databaseService.products.getById(productId);
      setProduct(data);
      return { data, error: data ? null : 'Produto não encontrado' };
    });
  }, [productId, execute]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  return {
    product,
    loading,
    error,
    refetch: loadProduct,
  };
}
