package org.example.library.factory;

public abstract class Book {
    protected String title;
    protected String author;
    protected String category;

    public abstract String getType();

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    @Override
    public String toString() {
        return "Book{" +
                "title='" + title + '\'' +
                ", author='" + author + '\'' +
                ", category='" + category + '\'' +
                '}';
    }
}
