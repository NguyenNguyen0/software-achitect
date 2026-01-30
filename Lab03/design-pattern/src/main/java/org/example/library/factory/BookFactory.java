package org.example.library.factory;

public class BookFactory {

    public static Book createBook(String type, String title, String author, String category) {
        return switch (type) {
            case "PAPER" -> new PaperBook(title, author, category);
            case "EBOOK" -> new EBook(title, author, category);
            default -> throw new IllegalArgumentException("Unknown book type");
        };
    }
}
