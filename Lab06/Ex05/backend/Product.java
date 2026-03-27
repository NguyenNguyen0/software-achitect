package com.demo.search.model;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private String category;

    // Getters & Setters
    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
}
