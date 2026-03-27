package com.demo.search.controller;

import com.demo.search.model.Product;
import com.demo.search.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class SearchController {

    private final ProductRepository repo;

    public SearchController(ProductRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/search")
    public List<Product> search(@RequestParam(defaultValue = "") String q) {
        if (q.isBlank()) return List.of();
        return repo.searchByKeyword(q.trim());
    }
}
