package org.example.library.decorator;

public class SpecialEditionDecorator extends BorrowDecorator {

    public SpecialEditionDecorator(Borrow borrow) {
        super(borrow);
    }

    @Override
    public String getDescription() {
        return borrow.getDescription() + ", special edition";
    }

    @Override
    public double getCost() {
        return borrow.getCost() + 5;
    }
}
