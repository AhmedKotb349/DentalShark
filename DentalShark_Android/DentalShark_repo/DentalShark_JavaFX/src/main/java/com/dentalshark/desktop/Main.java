package com.dentalshark.desktop;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.concurrent.Worker;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyCodeCombination;
import javafx.scene.input.KeyCombination;
import javafx.scene.layout.StackPane;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;

import java.io.IOException;

/**
 * Desktop wrapper for DentalShark — loads the real React app in a
 * WebView, the same "wrap the actual app" approach used for the Android
 * build (frontend/android, via Capacitor), instead of re-implementing
 * screens natively.
 *
 * The bundled app/frontend/dist was built with VITE_API_URL pointing at
 * the deployed backend (https://dental-shark.vercel.app), so every API
 * call it makes goes there directly. This class only needs to serve
 * those static files locally (see LocalStaticServer) and point a
 * WebView at them — no backend process to spawn on this machine at all.
 */
public class Main extends Application {

    private final LocalStaticServer staticServer = new LocalStaticServer();

    @Override
    public void start(Stage stage) {
        stage.setTitle("DentalShark");
        stage.setMinWidth(1024);
        stage.setMinHeight(700);
        stage.setOnCloseRequest(e -> staticServer.stop());

        try {
            String url = staticServer.start();

            WebView webView = new WebView();
            WebEngine engine = webView.getEngine();
            engine.setJavaScriptEnabled(true);
            stage.titleProperty().bind(engine.titleProperty());

            engine.getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
                if (newState == Worker.State.FAILED) {
                    showLoadError(url);
                }
            });

            KeyCombination reload = new KeyCodeCombination(KeyCode.F5);
            webView.addEventHandler(javafx.scene.input.KeyEvent.KEY_PRESSED, event -> {
                if (reload.match(event)) engine.reload();
            });

            engine.load(url);

            stage.setScene(new Scene(new StackPane(webView), 1440, 900));
            stage.show();
        } catch (IOException e) {
            showStartupError(e.getMessage());
        }
    }

    private void showStartupError(String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle("Couldn't start DentalShark");
        alert.setHeaderText("Failed to serve the bundled app");
        alert.setContentText(message);
        alert.show();
    }

    private void showLoadError(String url) {
        Platform.runLater(() -> {
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setTitle("Couldn't load DentalShark");
            alert.setHeaderText("Could not reach " + url);
            alert.setContentText(
                "The app itself is served locally, but it also needs internet "
                + "access to reach the deployed backend at "
                + "https://dental-shark.vercel.app for logins/data. "
                + "Check your connection and press F5 to retry."
            );
            alert.show();
        });
    }

    public static void main(String[] args) {
        launch(args);
    }
}
