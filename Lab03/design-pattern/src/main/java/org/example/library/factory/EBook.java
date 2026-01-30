package org.example.library.factory;

public class EBook extends Book {
    public EBook(String title, String author, String category) {
        super();
        this.title = title;
        this.author = author;
        this.category = category;
    }

    @Override
    public String getType() {
        return "E-Book";
    }
}
