package org.example.library.factory;

public class PaperBook extends Book {
    public PaperBook(String title, String author, String category) {
        this.title = title;
        this.author = author;
        this.category = category;
    }

    @Override
    public String getType() {
        return "Paper Book";
    }
}
