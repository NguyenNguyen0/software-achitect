package org.example.library;

import org.example.library.decorator.BasicBorrow;
import org.example.library.decorator.Borrow;
import org.example.library.decorator.ExtendTimeDecorator;
import org.example.library.decorator.SpecialEditionDecorator;
import org.example.library.factory.Book;
import org.example.library.factory.BookFactory;
import org.example.library.observer.Librarian;
import org.example.library.observer.LibraryNotifier;
import org.example.library.observer.Observer;
import org.example.library.observer.Subscriber;
import org.example.library.singleton.Library;
import org.example.library.strategy.SearchByAuthor;
import org.example.library.strategy.SearchByTitle;
import org.example.library.strategy.SearchStrategy;

import java.util.List;

public class Main {
    public static void main(String[] args) {

        /* =========================
           1️⃣ Singleton: Library
        ========================== */
        Library library = Library.getInstance();

        /* =========================
           2️⃣ Observer: Notification
        ========================== */
        LibraryNotifier notifier = new LibraryNotifier();

        Observer librarian = new Librarian("Mr. Smith");
        Observer subscriber = new Subscriber("Alice");

        notifier.register(librarian);
        notifier.register(subscriber);

        /* =========================
           3️⃣ Factory Method: Add Books
        ========================== */
        Book book1 = BookFactory.createBook(
                "PAPER",
                "Clean Code",
                "Robert C. Martin",
                "Programming"
        );

        Book book2 = BookFactory.createBook(
                "EBOOK",
                "Design Patterns",
                "GoF",
                "Software Engineering"
        );

        library.addBook(book1);
        notifier.notifyNewBook(book1.getTitle());

        library.addBook(book2);
        notifier.notifyNewBook(book2.getTitle());

        System.out.println("Books list: " + library.getBooks());

        /* =========================
           4️⃣ Strategy: Search Books
        ========================== */
        System.out.println("\n--- Search by Title ---");
        SearchStrategy searchByTitle = new SearchByTitle();
        List<Book> result1 = searchByTitle.search(
                library.getBooks(),
                "Clean"
        );
        result1.forEach(
                b -> System.out.println(b.getTitle())
        );

        System.out.println("\n--- Search by Author ---");
        SearchStrategy searchByAuthor = new SearchByAuthor();
        List<Book> result2 = searchByAuthor.search(
                library.getBooks(),
                "GoF"
        );
        result2.forEach(
                b -> System.out.println(b.getTitle())
        );

        /* =========================
           5️⃣ Decorator: Borrow Book
        ========================== */
        System.out.println("\n--- Borrow Book ---");

        Borrow borrow = new BasicBorrow();
        borrow = new ExtendTimeDecorator(borrow);
        borrow = new SpecialEditionDecorator(borrow);

        System.out.println("Borrow Detail: " + borrow.getDescription());
        System.out.println("Total Cost: $" + borrow.getCost());

        /* =========================
           6️⃣ Observer: Overdue Book
        ========================== */
        notifier.notifyObservers("Book 'Clean Code' is overdue!");

        System.out.println("\n=== System Demo Completed ===");
    }
}