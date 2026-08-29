module com.dentalshark.desktop {
    requires javafx.controls;
    requires javafx.web;
    requires jdk.httpserver;

    opens com.dentalshark.desktop to javafx.graphics, javafx.fxml;
    exports com.dentalshark.desktop;
}
