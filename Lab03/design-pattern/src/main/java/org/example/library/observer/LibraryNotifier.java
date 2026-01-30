package org.example.library.observer;

import java.util.ArrayList;
import java.util.List;

public class LibraryNotifier implements Subject {
    private final List<Observer> observers = new ArrayList<>();

    public void notifyNewBook(String bookName) {
        notifyObservers("New book added: " + bookName);
    }

    @Override
    public void register(Observer o) {

    }

    @Override
    public void remove(Observer o) {

    }

    @Override
    public void notifyObservers(String message) {

    }
}
