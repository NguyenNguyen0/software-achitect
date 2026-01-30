package org.example.library.decorator;

public class ExtendTimeDecorator extends BorrowDecorator {
    public ExtendTimeDecorator(Borrow borrow) {
        super(borrow);
    }

    public String getDescription() {
        return borrow.getDescription() + ", extended time";
    }

    public double getCost() {
        return borrow.getCost() + 5;
    }
}
