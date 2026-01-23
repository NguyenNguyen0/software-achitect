package singleton;

public class DatabaseConnection {
    private final String value;
    private static DatabaseConnection instance;
    private DatabaseConnection(String value) {
        this.value = value;
    }

    public static DatabaseConnection getInstance() {
        if (instance == null) {
            instance = new DatabaseConnection("MySQL Database");
        }
        return instance;
    }

    @Override
    public String toString() {
        return value;
    }
}
