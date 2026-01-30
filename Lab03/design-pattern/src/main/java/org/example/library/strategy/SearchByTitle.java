package org.example.library.strategy;

import org.example.library.factory.Book;

import java.util.List;

public class SearchByTitle implements SearchStrategy {
    @Override
    public List<Book> search(List<Book> books, String keyword) {
        return books.stream()
                .filter(b -> b.getTitle().contains(keyword))
                .toList();
    }
}
