package org.example.library.decorator;

public class BasicBorrow implements Borrow {
    @Override
    public String getDescription() {
        return "Borrow book";
    }

    @Override
    public double getCost() {
        return 0;
    }
}
