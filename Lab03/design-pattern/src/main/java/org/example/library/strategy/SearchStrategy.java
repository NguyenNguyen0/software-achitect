package org.example.library.strategy;

import org.example.library.factory.Book;

import java.util.List;

public interface SearchStrategy {
    List<Book> search(List<Book> books, String keyword);
}