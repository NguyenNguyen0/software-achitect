package org.example.library.observer;

public class Librarian implements Observer {

    private final String name;

    public Librarian(String name) {
        this.name = name;
    }

    @Override
    public void update(String message) {
        System.out.println("[Librarian " + name + "] " + message);
    }
}
