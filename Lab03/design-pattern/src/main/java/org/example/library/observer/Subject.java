package org.example.library.observer;

public interface Subject {
    void register(Observer o);

    void remove(Observer o);

    void notifyObservers(String message);
}
