package com.demo.search.repository;

import com.demo.search.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    // Gọi Stored Procedure sp_search_products
    @Query(value = "CALL sp_search_products(:keyword)", nativeQuery = true)
    List<Product> searchByKeyword(@Param("keyword") String keyword);
}
